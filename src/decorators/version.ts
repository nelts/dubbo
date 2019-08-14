import 'reflect-metadata';
import namespace from './namespace';
export default function Version(version: string): ClassDecorator {
  return target => {
    Reflect.defineMetadata(namespace.RPC_VERSION, version, target);
  }
}