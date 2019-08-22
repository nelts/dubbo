import 'reflect-metadata';
import namespace from './namespace';
import { ProviderServiceChunkMethodParametersSchema } from 'dubbo.ts';

export default function Parameters(...args: ProviderServiceChunkMethodParametersSchema[]): MethodDecorator {
  return (target, property, descriptor) => {
    Reflect.defineMetadata(namespace.RPC_PARAMETERS, args, descriptor.value);
  }
}