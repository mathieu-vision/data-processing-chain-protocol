import {
  ChainStatus,
  NodeSignal,
  ReportingMessage,
  SupervisorPayloadStartPendingChain,
} from '../types/types';
import { NodeSupervisor } from '../core/NodeSupervisor';
import { MonitoringAgent } from '../agents/MonitoringAgent';
import { Logger } from '../utils/Logger';

export namespace Ext {
  /**
   * Default class, responsible for handling monitoring signals.
   * Processes reporting messages and triggers actions based on the message signal.
   */
  export class MonitoringSignalHandler {
    /**
     * Handles a reporting message and triggers appropriate actions based on the signal type.
     * This function serves as a flexible entry point for processing intercepted signals
     * originating from the reporting agent, allowing adaptation to various system needs.
     * Specifically, it processes node setup completion signals in a chain, but can be
     * extended to handle other signal types.
     *
     * Note: This is a bridge between global messages and the rest of the system,
     * enabling the dispatch of actions tailored to specific goals.
     *
     * @static
     * @async
     * @param {ReportingMessage} message - The message containing the signal and associated chain data.
     * @returns {Promise<void>} - Resolves when the message is fully processed.
     */
    static async handle(message: ReportingMessage) {
      const monitoring = MonitoringAgent.retrieveService();
      const status = message.signal?.status;
      switch (status) {
        /*
         *
         */
        case ChainStatus.NODE_SETUP_COMPLETED: {
          let count = monitoring.getChainSetupCount(message.chainId);
          if (!count) {
            monitoring.setChainSetupCount(message.chainId, 1);
          } else {
            monitoring.setChainSetupCount(message.chainId, count + 1);
          }
          count = monitoring.getChainSetupCount(message.chainId);
          if (count && count >= message.count) {
            const supervisor = NodeSupervisor.retrieveService();
            const payload: SupervisorPayloadStartPendingChain = {
              signal: NodeSignal.CHAIN_START_PENDING,
              id: message.chainId,
            };
            await supervisor.handleRequest(payload);
            Logger.info({
              message: `MonitoringSignalHandler: Chain setup completed`,
            });
          }
          break;
        }
        /*
         *
         */
        case ChainStatus.CHILD_CHAIN_COMPLETED:
          await monitoring.handleChildChainCompletion(
            '' /*message.childChainId!*/,
          );
          break;
        /*
         *
         */
        default:
          Logger.info({
            message: `MonitoringSignalHandler: Signal handler not found for ${JSON.stringify(message.signal, null, 2)}`,
          });
          break;
      }
    }
  }
}
