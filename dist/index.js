"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = require("./compilers/service");
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
        this._provider.on('packet', async (ctx) => {
            const target = ctx.interface.Constructor;
            const injector = this.app.injector.get(target);
            if (!injector[ctx.method]) {
                ctx.status = dubbo_ts_1.PROVIDER_CONTEXT_STATUS.SERVICE_NOT_FOUND;
                ctx.body = `cannot find the method of ${ctx.method} on ${ctx.interface}:${ctx.interfaceVersion}@${ctx.group}#${ctx.dubboVersion}`;
            }
            else {
                let result = await Promise.resolve(injector[ctx.method](...ctx.parameters));
                if (this._rpc_result_callback) {
                    const _result = this._rpc_result_callback(ctx.parameters, result);
                    if (_result !== undefined) {
                        result = _result;
                    }
                }
                ctx.body = result;
            }
        });
    }
    async componentDidCreated() {
        await this._registry.connect();
        await new Promise((resolve, reject) => {
            this._provider.listen(this.app.port, (err) => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
        this.app.logger.info('TCP SERVER STARTED.', 'pid:', process.pid, 'port:', this.app.port);
        await this.app.emit('ServerStarted');
    }
    async componentWillDestroy() {
        await new Promise(resolve => this._provider.close(resolve));
        this._consumer && await new Promise(resolve => this._consumer.close(resolve));
        await this.app.emit('ServerStopping');
    }
    async componentDidDestroyed() {
        this.registry.destory();
        await this.app.emit('ServerStopped');
    }
}
exports.default = Dubbo;
