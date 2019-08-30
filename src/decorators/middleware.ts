import 'reflect-metadata';
import namespace from './namespace';
import { ComposeMiddleware } from '@nelts/utils';
import Context from '../context';

export default function Middleware(...args: ComposeMiddleware<Context>[]): MethodDecorator {
  return (target, property, descriptor) => {
    const middlewares: ComposeMiddleware<Context>[] = Reflect.getMetadata(namespace.RPC_MIDDLEWARE, descriptor.value) || [];
    middlewares.unshift(...args);
    Reflect.defineMetadata(namespace.RPC_MIDDLEWARE, middlewares, descriptor.value);
  }
}