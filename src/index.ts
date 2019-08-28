import 'reflect-metadata';
import * as net from 'net';
import WorkerFactory, { WorkerServiceFrameworker } from '@nelts/worker';
import ServiceCompiler from './compilers/service';
import namespace from './decorators/namespace';
import { Compose, ComposeMiddleware } from '@nelts/utils';
import { 
  Registry, 
  RegistryInitOptions, 
  Provider, 
  ProviderContext, 
  PROVIDER_CONTEXT_STATUS, 
  Consumer, 
  ConsumerServiceInitOptions,
  ProviderInitOptions,
  ProviderChunk,
  SwaggerProvider
} from 'dubbo.ts';

import rpc_interface from './decorators/interface';
import rpc_group from './decorators/group';
import rpc_method from './decorators/method';
import rpc_version from './decorators/version';
import rpc_delay from './decorators/deplay';
import rpc_retries from './decorators/retries';
import rpc_timeout from './decorators/timeout';
import rpc_middleware from './decorators/middleware';
import rpc_description from './decorators/description';
import rpc_parameters from './decorators/parameters';
import rpc_response from './decorators/response';
import rpc_summay from './decorators/summary';

const rpc = {
  interface: rpc_interface,
  group: rpc_group,
  method: rpc_method,
  version: rpc_version,
  delay: rpc_delay,
  retries: rpc_retries,
  timeout: rpc_timeout,
  middleware: rpc_middleware,
  description: rpc_description,
  parameters: rpc_parameters,
  response: rpc_response,
  summay: rpc_summay,
}

export {
  rpc,
}

type RPC_RESULT_CALLBACK_TYPE = (req: any[], res: any) => (ctx: ProviderContext) => any;

export default class Dubbo implements WorkerServiceFrameworker {
  private _app: WorkerFactory<Dubbo>;
  private _registry: Registry;
  private _provider: Provider;
  private _consumer: Consumer;
  private _swagger: SwaggerProvider;
  private _rpc_result_callback: RPC_RESULT_CALLBACK_TYPE;
  private _rpc_before_middleware: (s: any) => ComposeMiddleware<ProviderContext>;
  public server: net.Server;
  constructor(app: WorkerFactory<Dubbo>) {
    this._app = app;
    if (this.app.socket) {
      process.on('message', (message: any, socket: net.Socket) => {
        switch (message) {
          case this.app.sticky: this.resumeConnection(socket); break;
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

  setRpcBeforeMiddleware(fn: (s: any) => ComposeMiddleware<ProviderContext>) {
    this._rpc_before_middleware = fn;
    return this;
  }

  setRpcResultCallback(fn: RPC_RESULT_CALLBACK_TYPE) {
    this._rpc_result_callback = fn;
    return this;
  }

  private resumeConnection(socket: net.Socket) {
    if (!this.server) return socket.destroy();
    this.server.emit('connection', socket);
    socket.resume();
  }

  async componentWillCreate() {
    this.app.compiler.addCompiler(ServiceCompiler);
    const Provider_Options = this.app.configs.provider as ProviderInitOptions;
    const Consumer_Options = this.app.configs.consumer as ConsumerServiceInitOptions;
    this._registry = new Registry(this.app.configs.registry as RegistryInitOptions);
    Provider_Options.port = this.app.port;
    Provider_Options.pid = process.pid;
    Provider_Options.registry = this._registry;
    Provider_Options.logger = this.app.logger;
    if (Consumer_Options) {
      Consumer_Options.pid = process.pid;
      Consumer_Options.registry = this._registry;
      this._consumer = new Consumer(Consumer_Options);
    }
    this._provider = new Provider(Provider_Options);
    this._provider.on('data', async (ctx: ProviderContext, chunk: ProviderChunk<string>) => {
      const req = ctx.req;
      const injector = this.app.injector.get<any>(chunk.interfacetarget);
      if (!injector) {
        ctx.status = PROVIDER_CONTEXT_STATUS.SERVER_TIMEOUT;
        ctx.body = `cannot find the interface of ${chunk.interfacetarget}`;
      } else if (!injector[req.method]) {
        ctx.status = PROVIDER_CONTEXT_STATUS.SERVICE_NOT_FOUND;
        ctx.body = `cannot find the method of ${req.method} on ${req.attachments.interface}:${req.attachments.version}@${req.attachments.group}#${req.dubboVersion}`;
      } else {
        const structor = injector.constructor;
        const middlewares: ComposeMiddleware<ProviderContext>[] = (Reflect.getMetadata(namespace.RPC_MIDDLEWARE, structor.prototype[req.method]) || []).slice(0);
        middlewares.push(async ctx => {
          let result = await Promise.resolve(injector[req.method](...req.parameters)).catch(e => Promise.resolve(e));
          if (this._rpc_result_callback) {
            const res = this._rpc_result_callback(req.parameters, result);
            const _result = await Promise.resolve(res(ctx));
            if (_result !== undefined) {
              result = _result;
            }
          }
          ctx.body = result;
        });
        if (this._rpc_before_middleware) middlewares.unshift(this._rpc_before_middleware(structor));
        const composed = Compose(middlewares);
        await composed(ctx)
          .catch(e => ctx.sync('rollback').then(() => Promise.reject(e)))
          .then(() => ctx.sync('commit'));
      }
    });
    if (this._app.configs.swagger) {
      this._swagger = new SwaggerProvider(
        this._app.configs.swagger,
        this._provider,
        this._app.logger
      );
    }
  }

  async componentDidCreated() {
    await this._provider.listen();
    if (this._consumer) await this._consumer.listen();
    if (this._swagger) await this._swagger.publish();
    this.app.logger.info('TCP SERVER STARTED.', 'pid:', process.pid, 'port:', this.app.port);
    await this.app.emit('ServerStarted');
  }

  async componentWillDestroy() {
    if (this._swagger) await this._swagger.unPublish();
    await this._provider.close();
    this._consumer && await this._consumer.close();
    await this.app.emit('ServerStopping');
  }

  async componentDidDestroyed() {
    await this.app.emit('ServerStopped');
  }
}