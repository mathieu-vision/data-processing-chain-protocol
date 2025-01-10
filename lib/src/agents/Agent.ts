import EventEmitter from 'node:events';
import { randomUUID } from 'node:crypto';

/**
 * Abstract base Agent class that extends EventEmitter
 * @abstract
 */
export abstract class Agent extends EventEmitter {
  protected uid: string;

  /**
   * Creates a new Agent instance with a unique identifier
   */
  constructor() {
    super();
    this.uid = randomUUID();
  }
}
