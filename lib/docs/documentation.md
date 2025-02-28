# Technical Documentation for the DPCP Library (Data Processing Chain Protocol)

## Introduction

The DPCP library is a Node.js framework designed to orchestrate distributed data processing workflows. It uses a hierarchical architecture consisting of **chains**, **nodes**, and **pipelines** to enable scalable and modular integration with external services, while offering monitoring and execution control capabilities.

---

## Project Overview

The DPCP library facilitates the creation and management of executable nodes within a Node.js environment. Its architecture is structured as follows:

- **Chain**: A sequence of nodes that collectively define a data processing workflow.
- **Node**: An independent processing unit that executes multiple pipelines concurrently.
- **Pipeline**: A series of processes within a node, executed serially.
- **Process**: An encapsulated interaction with an external service or API.

This design allows nodes to process data in parallel via pipelines, with each pipeline handling sequential tasks making the system capable of handling complex, distributed workflows.

---

## Core Components

### 1. NodeSupervisor
**Primary Role**: Central orchestrator of the DPCP system.

- **Responsibilities**:
  - Manages the lifecycle of nodes (creation, execution, deletion).
  - Creates and coordinates processing chains.
  - Distributes chains across local and remote nodes.
  - Handles execution and maintains relationships between nodes.
  - Processes signals for node and chain actions.

- **Signal Handling**:  
  The NodeSupervisor intercepts and manages a range of signals to control node and chain behavior. Key signals include:
  - **`NODE_SETUP`**: Initializes a node with a provided configuration.
  - **`NODE_CREATE`**: Creates a new node with specified parameters.
  - **`NODE_DELETE`**: Removes an existing node by its ID.
  - **`NODE_PAUSE`**: Pauses the execution of a node.
  - **`NODE_DELAY`**: Delays the execution of a node for a specified duration.
  - **`NODE_RUN`**: Executes a node with provided data.
  - **`NODE_SEND_DATA`**: Sends data to a node.
  - **`CHAIN_PREPARE`**: Prepares chain distribution for execution.
  - **`CHAIN_START`**: Starts a chain with the provided data.
  - **`CHAIN_START_PENDING`**: Begins execution of a chain that was pending.
  - **`CHAIN_DEPLOY`**: Deploys a chain with specific configurations and data.
  - **`NODE_SUSPEND`/`NODE_RESUME`**: Suspends or resumes node execution.

- **Key Features**:
  - **Singleton Pattern**: Ensures centralized management.
  - **Dynamic Deployment**: Supports flexible chain deployment and node distribution across local and remote environments.
  - **Comprehensive Signal Handling**: Provides control over node and chain actions via the signal set listed above.

---

### 2. Node
**Primary Role**: Core processing unit within a chain.

- **Responsibilities**:
  - Executes multiple pipelines concurrently.
  - Tracks execution state and manages data flow.
  - Reports status updates via the **ReportingAgent**.
  - Routes output data to subsequent nodes.
  - Supports child chains for nested workflows.

- **Key Features**:
  - Manages dependencies and execution queues.
  - Provides execution control (suspend, resume) via the **NodeStatusManager**.
  - Configurable for both local and remote routing.

---

### 3. PipelineProcessor
**Primary Role**: Executes processes that interact with external services.

- **Responsibilities**:
  - Integrates with external services using a callback mechanism.
  - Optionally transforms data before and after service calls.
  - Manages sequential request–response flows within a pipeline.

- **Key Features**:
  - **Callback-Based Interaction**: Supports service integration through methods like `PipelineProcessor.setCallbackService`.
  - **Dynamic Configuration**: Allows configuration of service targets.
  - **Metadata Handling**: Supports enriched processing by incorporating metadata.

---

### 4. ReportingAgent
**Primary Role**: Tracks and reports node status.

- **Responsibilities**:
  - Instantiated by the **MonitoringAgent** for each node.
  - Relays real-time status updates to the **MonitoringAgent**.
  - Supports both **local-signal** (internal) and **global-signal** (broadcasted) notifications.

- **Key Features**:
  - Maintains a comprehensive status history.
  - Provides a direct communication channel between nodes and the **MonitoringAgent**.

---

### 5. MonitoringAgent
**Primary Role**: Coordinates status tracking and external signal broadcasting.

- **Responsibilities**:
  - Manages the lifecycle of **ReportingAgent** instances.
  - Aggregates node status updates into a unified workflow view.
  - Broadcasts chain-level status updates to external systems.

- **Key Features**:
  - **Singleton Design**: Ensures centralized monitoring.
  - **Configurable Callbacks**: Offers customizable reporting and broadcasting options.
  - **Remote Support**: Facilitates remote monitoring configurations.

---

### 6. NodeStatusManager
**Primary Role**: Manages node execution state and signals.

- **Responsibilities**:
  - Handles signals such as `NODE_SUSPEND`, `NODE_RESUME`, and `NODE_STOP`.
  - Manages the node’s execution queue and state transitions.
  - Saves and restores execution state during suspension and resumption.

- **Interactions**:
  - Works with the **Node** to control execution flow.
  - Receives signals from the **NodeSupervisor** to adjust behavior.
  - Ensures orderly state transitions to prevent invalid operations.

- **Key Features**:
  - **Signal Queue Management**: Allows control over node state.
  - **State Preservation**: Ensures resumption after suspension.
  - **Error Handling**: Prevents invalid state transitions.

---

## Component Flows and Relationships

### Components and Relationships

```plaintext
NodeSupervisor
    ↓ manages
    Node
        ↔ ReportingAgent (for status reporting)
        contains →
            NodeStatusManager (manages signals and execution state)
            [Pipeline 1 || Pipeline n] (concurrent execution)
            executes →
                [PipelineProcessor 1, PipelineProcessor n] (serial processes)
                interacts with → External Service
    ↓ can deploy
    Child Chains (serial or parallel execution)
    ↑ monitored by
    MonitoringAgent
```

### Explanation of Components and Relationships:
- **NodeSupervisor**: Manages the overall node operations.
- **Node**: 
  - Interacts bidirectionally with the **ReportingAgent** for status updates.
  - Contains the **NodeStatusManager** to handle signals and manage execution state.
  - Executes one or more pipelines concurrently.
  - Supports the integration of child chains for nested workflows.
- **PipelineProcessors**: Execute processes in serial order, interacting with external services as needed.
- **MonitoringAgent**: Aggregates status updates and broadcasts chain statuses externally.

---

## Data Flows

### 1. Chain Initialization
- **Process**:
  - The **NodeSupervisor** configures and distributes nodes.
  - Nodes request **ReportingAgent** instances from the **MonitoringAgent**.
- **Flow**:
  ```
  NodeSupervisor → Create Chain Config → Distribute Nodes → Set Up Monitoring
  ```

### 2. Execution Flow
- **Process**:
  - Nodes process incoming data via **PipelineProcessors**.
  - Status updates are continuously sent via the **ReportingAgent**.
  - Processed data is forwarded to the next node in the chain.
- **Flow**:
  ```
  Node → Process Data → Report Status → Forward Data
  ```

### 3. Monitoring Flow
- **Process**:
  - **ReportingAgents** capture status changes from each node.
  - The **MonitoringAgent** aggregates these updates and broadcasts chain status externally.
- **Flow**:
  ```
  ReportingAgent → Capture Status → MonitoringAgent → Broadcast Status
  ```

---

## Typical Workflow Example

1. **Configure Callbacks**: Set up service and monitoring callbacks.
2. **Create Chain Configuration**: Define nodes, services, and locations.
3. **Deploy Chain**: Issue a `CHAIN_DEPLOY` signal via `NodeSupervisor.handleRequest`.
4. **Prepare Distribution**: The **NodeSupervisor** sets up local/remote nodes.
5. **Start Chain**: Initiate execution with a `CHAIN_START` signal and provide input data.
6. **Execute and Monitor**: Nodes process data while the **MonitoringAgent** tracks progress and aggregates status updates.

---

## Error Handling and Logging

- **Mechanism**: A built-in logging system (**Logger**) tracks operations, warnings, and errors.
- **Customization**: Users can configure logging outputs as needed, ensuring that error handling aligns with specific workflow requirements.

---

## Advanced Features

### Child Chains
- **Description**: Nodes can deploy nested workflows (child chains) to handle sub-processes.
- **Execution Modes**:
  - **Serial**: Child chains execute sequentially; the parent waits for their completion.
  - **Parallel**: Child chains run concurrently with the parent’s processing.
- **Configuration**: Defined via `chainConfig` and the `childMode` parameter in node configurations.
- **Management**: The **NodeSupervisor** deploys and coordinates child chains, while the **MonitoringAgent** tracks their status.

### Execution Control
- **Signals**: In addition to the comprehensive set managed by **NodeSupervisor**, signals like `NODE_SUSPEND`, `NODE_RESUME`, and `NODE_STOP` offer execution control.
- **State Management**: The **NodeStatusManager** manages signal queues and state transitions, preserving execution state during suspensions for resumption.

---

## Conclusion

The DPCP library offers a solution for managing distributed data processing chains. Its hierarchical design, augmented with signal handling, execution control (including child chains), and monitoring, makes it an adapted tool for orchestrating complex workflows in Node.js environments.