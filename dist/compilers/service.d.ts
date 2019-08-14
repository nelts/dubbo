import 'reflect-metadata';
import { WorkerPlugin } from '@nelts/worker';
import Dubbo from '../index';
export default function Service<T extends WorkerPlugin<Dubbo>>(plugin: T): Promise<void>;
