"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const namespace_1 = require("./namespace");
function Response(schema) {
    return (target, property, descriptor) => {
        Reflect.defineMetadata(namespace_1.default.RPC_RESPONSE, schema, descriptor.value);
    };
}
exports.default = Response;
