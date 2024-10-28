import EventEmitter from 'node:events';
import { randomUUID } from 'node:crypto';

export abstract class Agent extends EventEmitter {
  protected uid: string;
  constructor() {
    super();
    this.uid = randomUUID();
  }
}
