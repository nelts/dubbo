import 'reflect-metadata';
import namespace from './namespace';
export default function Group(group: string): ClassDecorator {
  return target => {
    Reflect.defineMetadata(namespace.RPC_GROUP, group, target);
  }
}