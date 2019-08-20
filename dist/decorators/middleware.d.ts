import 'reflect-metadata';
import { ComposeMiddleware } from '@nelts/utils';
import { ProviderContext } from 'dubbo.ts';
export default function Middleware(...args: ComposeMiddleware<ProviderContext>[]): MethodDecorator;
