/// <reference types="node" />
import 'reflect-metadata';
import * as net from 'net';
import WorkerFactory, { WorkerServiceFrameworker } from '@nelts/worker';
import { Registry, Provider, Consumer } from 'dubbo.ts';
import rpc_interface from './decorators/interface';
import rpc_group from './decorators/group';
import rpc_version from './decorators/version';
import rpc_delay from './decorators/deplay';
import rpc_retries from './decorators/retries';
import rpc_timeout from './decorators/timeout';
import rpc_middleware from './decorators/middleware';
declare const rpc: {
    interface: typeof rpc_interface;
    group: typeof rpc_group;
    method: MethodDecorator;
    version: typeof rpc_version;
    delay: typeof rpc_delay;
    retries: typeof rpc_retries;
    timeout: typeof rpc_timeout;
    middleware: typeof rpc_middleware;
};
export { rpc, };
export default class Dubbo implements WorkerServiceFrameworker {
    private _app;
    private _registry;
    private _provider;
    private _consumer;
    private _rpc_result_callback;
    server: net.Server;
    constructor(app: WorkerFactory<Dubbo>);
    readonly app: WorkerFactory<Dubbo>;
    readonly registry: Registry;
    readonly provider: Provider;
    readonly rpc: Consumer;
    setRpcResultCallback(fn: (req: any[], res: any) => any): this;
    private resumeConnection;
    componentWillCreate(): Promise<void>;
    componentDidCreated(): Promise<void>;
    componentWillDestroy(): Promise<void>;
    componentDidDestroyed(): Promise<void>;
}
