"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const path = require("path");
const globby = require("globby");
const namespace_1 = require("../decorators/namespace");
const utils_1 = require("@nelts/utils");
async function Service(plugin) {
    const dubbo = plugin.app.frameworker;
    const cwd = plugin.source;
    const files = await globby([
        'service/**/*.ts',
        'service/**/*.js',
        '!service/**/*.d.ts',
    ], { cwd });
    files.forEach((file) => {
        file = path.resolve(cwd, file);
        const service = utils_1.RequireDefault(file);
        const interfacename = Reflect.getMetadata(namespace_1.default.RPC_INTERFACE, service);
        const version = Reflect.getMetadata(namespace_1.default.RPC_VERSION, service);
        const group = Reflect.getMetadata(namespace_1.default.RPC_GROUP, service);
        const provider = Reflect.getMetadata(namespace_1.default.RPC_PROVIDER, service);
        const deplay = Reflect.getMetadata(namespace_1.default.RPC_DELAY, service);
        const retries = Reflect.getMetadata(namespace_1.default.RPC_RETRIES, service);
        const timeout = Reflect.getMetadata(namespace_1.default.RPC_TIMEOUT, service);
        const description = Reflect.getMetadata(namespace_1.default.RPC_DESCRIPTION, service);
        if (interfacename && provider && provider.id) {
            const ServiceProperties = Object.getOwnPropertyNames(service.prototype);
            const methods = [], parameters = {};
            for (let i = 0; i < ServiceProperties.length; i++) {
                const property = ServiceProperties[i];
                const target = service.prototype[property];
                if (property === 'constructor')
                    continue;
                const isMethod = Reflect.getMetadata(namespace_1.default.RPC_METHOD, target);
                const _parameters = Reflect.getMetadata(namespace_1.default.RPC_PARAMETERS, target);
                const _response = Reflect.getMetadata(namespace_1.default.RPC_RESPONSE, target);
                const _summary = Reflect.getMetadata(namespace_1.default.RPC_SUMMARY, target);
                if (_parameters) {
                    if (!parameters) {
                        parameters[property] = {
                            summary: _summary,
                            input: _parameters
                        };
                        if (_response)
                            parameters[property].output = _response;
                    }
                }
                isMethod && methods.push(property);
            }
            dubbo.provider.addService(provider.id, {
                interface: interfacename,
                revision: version || '0.0.0',
                version: version || '0.0.0',
                group: group,
                methods: methods,
                delay: deplay || -1,
                retries: retries || 2,
                timeout: timeout || 60000,
                description,
                parameters: parameters,
            });
        }
    });
}
exports.default = Service;
