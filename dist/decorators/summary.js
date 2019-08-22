"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const namespace_1 = require("./namespace");
function Parameters(str) {
    return (target, property, descriptor) => {
        Reflect.defineMetadata(namespace_1.default.RPC_SUMMARY, str, descriptor.value);
    };
}
exports.default = Parameters;
