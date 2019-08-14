"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const namespace_1 = require("./namespace");
function Version(version) {
    return target => {
        Reflect.defineMetadata(namespace_1.default.RPC_VERSION, version, target);
    };
}
exports.default = Version;
