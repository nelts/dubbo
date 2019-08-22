import 'reflect-metadata';
import namespace from './namespace';

export default function Parameters(str: string): MethodDecorator {
  return (target, property, descriptor) => {
    Reflect.defineMetadata(namespace.RPC_SUMMARY, str, descriptor.value);
  }
}