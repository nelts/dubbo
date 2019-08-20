import 'reflect-metadata';
import namespace from './namespace';
import { ComposeMiddleware } from '@nelts/utils';
import { ProviderContext } from 'dubbo.ts';

export default function Middleware(...args: ComposeMiddleware<ProviderContext>[]): MethodDecorator {
  return (target, property, descriptor) => {
    const middlewares: ComposeMiddleware<ProviderContext>[] = Reflect.getMetadata(namespace.RPC_MIDDLEWARE, descriptor.value) || [];
    middlewares.unshift(...args);
    Reflect.defineMetadata(namespace.RPC_MIDDLEWARE, middlewares, descriptor.value);
  }
}