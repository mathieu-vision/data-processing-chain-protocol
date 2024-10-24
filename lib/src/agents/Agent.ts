import EventEmitter from 'node:events';

export abstract class Agent extends EventEmitter {
  constructor() {
    super();
  }
}
