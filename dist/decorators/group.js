"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const namespace_1 = require("./namespace");
function Group(group) {
    return target => {
        Reflect.defineMetadata(namespace_1.default.RPC_GROUP, group, target);
    };
}
exports.default = Group;
