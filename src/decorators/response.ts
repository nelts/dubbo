import 'reflect-metadata';
import namespace from './namespace';

export default function Response(schema: any): MethodDecorator {
  return (target, property, descriptor) => {
    Reflect.defineMetadata(namespace.RPC_RESPONSE, schema, descriptor.value);
  }
}