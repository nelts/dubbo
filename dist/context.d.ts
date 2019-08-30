import { EventEmitter } from '@nelts/utils';
import { ProviderContext, PROVIDER_CONTEXT_STATUS } from 'dubbo.ts';
declare type StackCallback = () => Promise<any>;
export default class Context extends EventEmitter {
    private readonly packet;
    private _stacks;
    private _stackStatus;
    constructor(packet: ProviderContext);
    readonly logger: import("dubbo.ts").Logger;
    readonly req: {
        requestId: number;
        dubboVersion: string;
        interfaceName: string;
        interfaceVersion: string;
        method: string;
        parameters: any[];
        attachments: {
            path: string;
            interface: string;
            version: string;
            group?: string;
            timeout: number;
        };
    };
    status: PROVIDER_CONTEXT_STATUS;
    body: any;
    stash(fn: StackCallback): this;
    commit(): Promise<void>;
    rollback(e: Error): Promise<void>;
}
export {};
