import { EventEmitter } from '@nelts/utils';
import { ProviderContext, PROVIDER_CONTEXT_STATUS } from 'dubbo.ts';
type StackCallback = () => Promise<any>;
type StackStatus = 0 | 1 | 2;
export default class Context extends EventEmitter {
  private readonly packet: ProviderContext;
  // public status: PROVIDER_CONTEXT_STATUS;
  // public body: any;
  private _stacks: StackCallback[] = [];
  private _stackStatus: StackStatus = 0;
  constructor(packet: ProviderContext) {
    super();
    this.packet = packet;
  }

  get logger() {
    return this.packet.logger;
  }

  get req() {
    return this.packet.req;
  }

  set status(value: PROVIDER_CONTEXT_STATUS) {
    this.packet.status = value;
  }

  get status() {
    return this.packet.status;
  }

  set body(value: any) {
    this.packet.body = value;
  }

  get body() {
    return this.packet.body;
  }

  stash(fn: StackCallback) {
    this._stacks.push(fn);
    return this;
  }

  async commit() {
    if (this._stackStatus !== 0) return;
    await this.sync('ContextResolve');
    this._stackStatus = 2;
  }

  async rollback(e: Error) {
    if (this._stackStatus !== 0) return;
    const stacks = this._stacks.slice(0);
    let i = stacks.length;
    while (i--) await stacks[i]();
    await this.sync('ContextReject', e);
    this._stackStatus = 1;
  }
}