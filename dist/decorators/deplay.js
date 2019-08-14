"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const namespace_1 = require("./namespace");
function Delay(time) {
    return target => {
        Reflect.defineMetadata(namespace_1.default.RPC_DELAY, time, target);
    };
}
exports.default = Delay;
