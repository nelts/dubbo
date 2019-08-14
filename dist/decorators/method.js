"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const namespace_1 = require("./namespace");
exports.default = (function Method(target, property, descriptor) {
    Reflect.defineMetadata(namespace_1.default.RPC_METHOD, true, descriptor.value);
});
