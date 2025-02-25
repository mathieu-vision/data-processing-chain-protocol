import {
  ChainStatus,
  NodeSignal,
  NodeStatusMessage,
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
     * Triggers the pending occurrence workflow by sending a signal to the supervisor
     * @private
     * @static
     * @param {string} chainId - The ID of the chain
     * @returns {Promise<void>}
     */
    private static async triggerPendingOccurrence(chainId: string) {
      const supervisor = NodeSupervisor.retrieveService();
      const payload: SupervisorPayloadStartPendingChain = {
        signal: NodeSignal.CHAIN_START_PENDING_OCCURRENCE,
        id: chainId,
      };
      await supervisor.handleRequest(payload);
      Logger.event(`MonitoringSignalHandler: Start Pending Occurrence...`);
    }

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
      const chainId = message.chainId;
      switch (status) {
        /*
         * Handle ChainStatus.NODE_SETUP_COMPLETED
         */
        case ChainStatus.NODE_SETUP_COMPLETED: {
          let count = monitoring.getChainSetupCount(chainId);
          if (!count) {
            monitoring.setChainSetupCount(chainId, 1);
          } else {
            monitoring.setChainSetupCount(chainId, count + 1);
          }
          count = monitoring.getChainSetupCount(chainId);
          if (count && count >= message.count) {
            monitoring.setChainSetupCompleted(chainId);
            Logger.event(
              `MonitoringSignalHandler: Chain Nodes setup completed`,
            );
            let chainDeployed = monitoring.getChainDeployed(chainId);
            if (chainDeployed) {
              await this.triggerPendingOccurrence(chainId);
            }
          }
          break;
        }
        /*
         * Handle ChainStatus.CHAIN_DEPLOYED
         */
        case ChainStatus.CHAIN_DEPLOYED: {
          monitoring.setChainDeployed(chainId);
          Logger.event(`MonitoringSignalHandler: Chain deployed`);
          const chainSetupCompleted =
            monitoring.getChainSetupCompleted(chainId);
          if (chainSetupCompleted) {
            await this.triggerPendingOccurrence(chainId);
          }
          break;
        }

        case ChainStatus.CHAIN_NOTIFIED: {
          const { signal, payload } = message.signal;
          Logger.debug(`signal: ${signal} from ${chainId}`);
          Logger.debug(`message: ${JSON.stringify(message, null, 2)}`);
          const supervisor = NodeSupervisor.retrieveService();
          const nodeStatusMessage: NodeStatusMessage = {
            payload,
            chainId,
            signal: signal ?? NodeSignal.NODE_ERROR,
            nodeId: '',
            index: 0,
            count: 0,
          };
          supervisor.nodeStatusCallback(nodeStatusMessage);
          break;
        }

        /*
         *
         */
        default:
          Logger.event(
            `MonitoringSignalHandler:\n\t\tSignal handler not found for ${JSON.stringify(message.signal)}`,
          );
          break;
      }
    }
  }
}
