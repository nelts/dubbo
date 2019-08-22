"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const namespace_1 = require("./namespace");
function Parameters(...args) {
    return (target, property, descriptor) => {
        Reflect.defineMetadata(namespace_1.default.RPC_PARAMETERS, args, descriptor.value);
    };
}
exports.default = Parameters;
