"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const service_1 = require("./compilers/service");
const namespace_1 = require("./decorators/namespace");
const utils_1 = require("@nelts/utils");
const dubbo_ts_1 = require("dubbo.ts");
const interface_1 = require("./decorators/interface");
const group_1 = require("./decorators/group");
const method_1 = require("./decorators/method");
const version_1 = require("./decorators/version");
const deplay_1 = require("./decorators/deplay");
const retries_1 = require("./decorators/retries");
const timeout_1 = require("./decorators/timeout");
const rpc = {
    interface: interface_1.default,
    group: group_1.default,
    method: method_1.default,
    version: version_1.default,
    delay: deplay_1.default,
    retries: retries_1.default,
    timeout: timeout_1.default,
};
exports.rpc = rpc;
class Dubbo {
    constructor(app) {
        this._app = app;
        if (this.app.socket) {
            process.on('message', (message, socket) => {
                switch (message) {
                    case this.app.sticky:
                        this.resumeConnection(socket);
                        break;
                }
            });
        }
    }
    get app() {
        return this._app;
    }
    get registry() {
        return this._registry;
    }
    get provider() {
        return this._provider;
    }
    get rpc() {
        return this._consumer;
    }
    setRpcResultCallback(fn) {
        this._rpc_result_callback = fn;
        return this;
    }
    resumeConnection(socket) {
        if (!this.server)
            return socket.destroy();
        this.server.emit('connection', socket);
        socket.resume();
    }
    async componentWillCreate() {
        this.app.compiler.addCompiler(service_1.default);
        const Provider_Options = this.app.configs.provider;
        const Consumer_Options = this.app.configs.consumer;
        this._registry = new dubbo_ts_1.Registry(this.app.configs.registry);
        Provider_Options.port = this.app.port;
        Provider_Options.pid = process.pid;
        Provider_Options.registry = this._registry;
        Provider_Options.logger = this.app.logger;
        if (Consumer_Options) {
            Consumer_Options.pid = process.pid;
            Consumer_Options.registry = this._registry;
            this._consumer = new dubbo_ts_1.Consumer(Consumer_Options);
        }
        this._provider = new dubbo_ts_1.Provider(Provider_Options);
        this._provider.on('data', async (ctx, chunk) => {
            const req = ctx.req;
            const injector = this.app.injector.get(chunk.interfacetarget);
            if (!injector) {
                ctx.status = dubbo_ts_1.PROVIDER_CONTEXT_STATUS.SERVER_TIMEOUT;
                ctx.body = `cannot find the interface of ${chunk.interfacetarget}`;
            }
            else if (!injector[req.method]) {
                ctx.status = dubbo_ts_1.PROVIDER_CONTEXT_STATUS.SERVICE_NOT_FOUND;
                ctx.body = `cannot find the method of ${req.method} on ${req.attachments.interface}:${req.attachments.version}@${req.attachments.group}#${req.dubboVersion}`;
            }
            else {
                const structor = injector.constructor;
                const middlewares = (Reflect.getMetadata(namespace_1.default.RPC_MIDDLEWARE, structor.prototype[req.method]) || []).slice(0);
                middlewares.push(async (ctx) => {
                    let result = await Promise.resolve(injector[req.method](...req.parameters)).catch(e => Promise.resolve(e));
                    if (this._rpc_result_callback) {
                        const _result = await Promise.resolve(this._rpc_result_callback(req.parameters, result));
                        if (_result !== undefined) {
                            result = _result;
                        }
                    }
                    ctx.body = result;
                });
                const composed = utils_1.Compose(middlewares);
                await composed(ctx);
            }
        });
    }
    async componentDidCreated() {
        await this._provider.listen();
        if (this._consumer)
            await this._consumer.listen();
        this.app.logger.info('TCP SERVER STARTED.', 'pid:', process.pid, 'port:', this.app.port);
        await this.app.emit('ServerStarted');
    }
    async componentWillDestroy() {
        await this._provider.close();
        this._consumer && await this._consumer.close();
        await this.app.emit('ServerStopping');
    }
    async componentDidDestroyed() {
        await this.app.emit('ServerStopped');
    }
}
exports.default = Dubbo;
