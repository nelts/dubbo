/// <reference types="node" />
import 'reflect-metadata';
import * as net from 'net';
import WorkerFactory, { WorkerServiceFrameworker } from '@nelts/worker';
import { ComposeMiddleware } from '@nelts/utils';
import Context from './context';
import { Registry, Provider, Consumer } from 'dubbo.ts';
import rpc_interface from './decorators/interface';
import rpc_group from './decorators/group';
import rpc_version from './decorators/version';
import rpc_delay from './decorators/deplay';
import rpc_retries from './decorators/retries';
import rpc_timeout from './decorators/timeout';
import rpc_middleware from './decorators/middleware';
import rpc_description from './decorators/description';
import rpc_parameters from './decorators/parameters';
import rpc_response from './decorators/response';
import rpc_summay from './decorators/summary';
declare const rpc: {
    interface: typeof rpc_interface;
    group: typeof rpc_group;
    method: MethodDecorator;
    version: typeof rpc_version;
    delay: typeof rpc_delay;
    retries: typeof rpc_retries;
    timeout: typeof rpc_timeout;
    middleware: typeof rpc_middleware;
    description: typeof rpc_description;
    parameters: typeof rpc_parameters;
    response: typeof rpc_response;
    summay: typeof rpc_summay;
};
export { rpc, Context, };
declare type RPC_RESULT_CALLBACK_TYPE = (req: any[], res: any) => (ctx: Context) => any;
export default class Dubbo implements WorkerServiceFrameworker {
    private _app;
    private _registry;
    private _provider;
    private _consumer;
    private _swagger;
    private _rpc_result_callback;
    private _rpc_before_middleware;
    server: net.Server;
    constructor(app: WorkerFactory<Dubbo>);
    readonly app: WorkerFactory<Dubbo>;
    readonly registry: Registry;
    readonly provider: Provider;
    readonly rpc: Consumer;
    setRpcBeforeMiddleware(fn: (s: any) => ComposeMiddleware<Context>): this;
    setRpcResultCallback(fn: RPC_RESULT_CALLBACK_TYPE): this;
    private resumeConnection;
    componentWillCreate(): Promise<void>;
    componentDidCreated(): Promise<void>;
    componentWillDestroy(): Promise<void>;
    componentDidDestroyed(): Promise<void>;
}
