"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@nelts/utils");
class Context extends utils_1.EventEmitter {
    constructor(packet) {
        super();
        this._stacks = [];
        this._stackStatus = 0;
        this.packet = packet;
    }
    get logger() {
        return this.packet.logger;
    }
    get req() {
        return this.packet.req;
    }
    set status(value) {
        this.packet.status = value;
    }
    get status() {
        return this.packet.status;
    }
    set body(value) {
        this.packet.body = value;
    }
    get body() {
        return this.packet.body;
    }
    stash(fn) {
        this._stacks.push(fn);
        return this;
    }
    async commit() {
        if (this._stackStatus !== 0)
            return;
        await this.sync('ContextResolve');
        this._stackStatus = 2;
    }
    async rollback(e) {
        if (this._stackStatus !== 0)
            return;
        const stacks = this._stacks.slice(0);
        let i = stacks.length;
        while (i--)
            await stacks[i]();
        await this.sync('ContextReject', e);
        this._stackStatus = 1;
    }
}
exports.default = Context;
