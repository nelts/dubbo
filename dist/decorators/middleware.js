"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const namespace_1 = require("./namespace");
function Middleware(...args) {
    return (target, property, descriptor) => {
        const middlewares = Reflect.getMetadata(namespace_1.default.RPC_MIDDLEWARE, descriptor.value) || [];
        middlewares.unshift(...args);
        Reflect.defineMetadata(namespace_1.default.RPC_MIDDLEWARE, middlewares, descriptor.value);
    };
}
exports.default = Middleware;
