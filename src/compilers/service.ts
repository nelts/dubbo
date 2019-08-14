import 'reflect-metadata';
import * as path from 'path';
import * as globby from 'globby';
import namespace from '../decorators/namespace';
import { WorkerPlugin } from '@nelts/worker';
import Dubbo from '../index';
import { RequireDefault } from '@nelts/utils';
export default async function Service<T extends WorkerPlugin<Dubbo>>(plugin: T) {
  const dubbo = plugin.app.frameworker;
  const cwd = plugin.source;
  const files = await globby([
    'service/**/*.ts', 
    'service/**/*.js', 
    '!service/**/*.d.ts', 
  ], { cwd });
  files.forEach((file: string) => {
    file = path.resolve(cwd, file);
    const service = RequireDefault(file);
    const interfacename = Reflect.getMetadata(namespace.RPC_INTERFACE, service);
    const version = Reflect.getMetadata(namespace.RPC_VERSION, service);
    const group = Reflect.getMetadata(namespace.RPC_GROUP, service);
    const provider = Reflect.getMetadata(namespace.RPC_PROVIDER, service);
    const deplay = Reflect.getMetadata(namespace.RPC_DELAY, service);
    const retries = Reflect.getMetadata(namespace.RPC_RETRIES, service);
    const timeout = Reflect.getMetadata(namespace.RPC_TIMEOUT, service);
    if (interfacename && provider && provider.id) {
      const ServiceProperties = Object.getOwnPropertyNames(service.prototype);
      const methods = [];
      for (let i = 0; i < ServiceProperties.length; i++) {
        const property = ServiceProperties[i];
        const target = service.prototype[property];
        if (property === 'constructor') continue;
        const isMethod = Reflect.getMetadata(namespace.RPC_METHOD, target);
        isMethod && methods.push(property);
      }
      dubbo.provider.addService({
        interface: interfacename,
        revision: version || '0.0.0',
        version:  version || '0.0.0',
        group: group,
        methods: methods,
        delay: deplay || -1,
        retries: retries || 2,
        timeout: timeout || 60000,
        target: provider.id,
      })
    }
  });
}