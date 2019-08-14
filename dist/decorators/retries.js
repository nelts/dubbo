"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const namespace_1 = require("./namespace");
function Retries(count) {
    return target => {
        Reflect.defineMetadata(namespace_1.default.RPC_RETRIES, count, target);
    };
}
exports.default = Retries;
