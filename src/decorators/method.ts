import 'reflect-metadata';
import namespace from './namespace';

export default <MethodDecorator>function Method(target, property, descriptor) {
  Reflect.defineMetadata(namespace.RPC_METHOD, true, descriptor.value);
}