import 'reflect-metadata';
import { ComposeMiddleware } from '@nelts/utils';
import Context from '../context';
export default function Middleware(...args: ComposeMiddleware<Context>[]): MethodDecorator;
