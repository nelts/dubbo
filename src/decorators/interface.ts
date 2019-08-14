import 'reflect-metadata';
import namespace from './namespace';
export default function Interface(name: string): ClassDecorator {
  return target => {
    Reflect.defineMetadata(namespace.RPC_INTERFACE, name, target);
  }
}