import {
  ChainStatus,
  NodeSignal,
  ReportingMessage,
  SupervisorPayloadStartPendingChain,
} from '../types/types';
import { NodeSupervisor } from '../core/NodeSupervisor';
import { MonitoringAgent } from './MonitoringAgent';
import { Logger } from '../extra/Logger';

/**
 * Class responsible for handling monitoring signals.
 * Processes reporting messages and triggers actions based on the message signal.
 */
export class MonitoringSignalHandler {
  /**
   * Processes a reporting message and triggers appropriate actions based on the signal type.
   * Specifically handles the completion of the node setup in a chain.
   *
   * @static
   * @async
   * @param {ReportingMessage} message - The message containing the signal and associated chain data.
   * @returns {Promise<void>} - Resolves when the message is fully processed.
   */
  static async handle(message: ReportingMessage) {
    const monitoring = MonitoringAgent.retrieveService();
    switch (message.signal) {
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
      case ChainStatus.CHILD_CHAIN_COMPLETED:
        await monitoring.handleChildChainCompletion(
          '' /*message.childChainId!*/,
        );
        break;
      default:
        Logger.info({
          message: `MonitoringSignalHandler: Signal handler not found for ${message.signal}`,
        });
        break;
    }
  }
}
