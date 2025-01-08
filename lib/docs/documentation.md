# Technical Documentation for the DPCP Library (Data Processing Chain Protocol)

## Introduction

The DPCP (Data Processing Chain Protocol) library is a Node.js framework that orchestrates distributed data processing workflows through a hierarchical system of chains, nodes, and pipelines, enabling scalable and modular integration with external services while providing monitoring and control capabilities.

## Project Overview
This project involves creating executable nodes within a **Node.js** environment. The system architecture is organized in a hierarchical structure where **chains** are composed of **nodes**. Each node operates as an independent unit and executes a set of **pipelines** concurrently. Within each pipeline, tasks are managed in a **serial process flow**, ensuring sequential execution of specific operations. 

Each process within a pipeline encapsulates a **call to an external service**, enabling modular and scalable integration with third-party services or internal APIs.

The overall structure of the system can be described as follows:
- **Chain**: A collection of nodes, defining a sequence of executable units.
- **Node**: A unit that contains multiple pipelines, each of which executes independently in parallel.
- **Pipeline**: A group of processes that execute serially within the node.
- **Process**: Encapsulates individual service interactions, representing calls to external services or APIs.

This layered architecture promotes modularity and simplifies the orchestration of complex workflows, making it suitable for scalable and distributed applications.


## Core Components

### 1. NodeSupervisor
**Primary Role**: Central orchestrator of the processing chain system
- Manages node lifecycle (creation, execution, deletion)
- Creates and coordinates processing chains
- Handles chain distribution across local/remote nodes
- Coordinates chain execution
- Maintains relationships between nodes

- **Signal Handling**: Intercepts and manages specific signals for node and chain actions. Key signals include:
- `NodeSignal.NODE_SETUP`: Initializes a node with a provided configuration.
- `NodeSignal.NODE_CREATE`: Creates a new node with specified parameters.
- `NodeSignal.NODE_DELETE`: Removes an existing node by its ID.
- `NodeSignal.NODE_PAUSE`: Pauses the execution of a node.
- `NodeSignal.NODE_DELAY`: Delays the execution of a node with a specified duration.
- `NodeSignal.NODE_RUN`: Executes a node with provided data.
- `NodeSignal.NODE_SEND_DATA`: Sends data to a node.
- `NodeSignal.CHAIN_PREPARE`: Prepares chain distribution for execution.
- `NodeSignal.CHAIN_START`: Starts a chain with given data.
- `NodeSignal.CHAIN_START_PENDING`: Begins execution of a pending chain.
- `NodeSignal.CHAIN_DEPLOY`: Deploys a chain with specific configurations and data.

**Key Features & Summary**:
- Singleton pattern for centralized management
- Flexible chain deployment and distribution across nodes
- Dynamic node setup, configuration, and lifecycle management
- Local and remote node coordination for distributed processing
- Comprehensive signal handling for precise control over node and chain actions

### 2. Node
**Primary Role**: Core processing unit within the chain
- Could executes multiple processing pipelines
- Tracks execution state and manages data flow
- Provides status updates via `ReportingAgent`
- Routes output data to the next node

**Key Features & Summary**:
- Unique identifier and dependency management
- Orchestrates sequential and parallel pipeline execution
- Status monitoring and event reporting
- Configurable routing to local or remote nodes

### 3. PipelineProcessor
**Primary Role**: Encapsulates and executes external service processes
- Integrates with external services for specific processing tasks
- Optionally transforms data before and after service communication
- Manages service requests and responses in sequence

**Key Features & Summary**:
- Dynamic service configuration
- Optional data transformation and processing
- Callback-based service interaction
- Metadata handling and data enrichment

### 4. ReportingAgent
**Primary Role**: Status tracking and signal reporting for nodes
- Created exclusively by the `MonitoringAgent` in response to a node’s request for monitoring support
- Each node retains a direct reference to its `ReportingAgent`, allowing seamless status updates
- Relays node status changes back to the `MonitoringAgent` that generated it using a structured notification system

**Key Features & Summary**:
- Controlled creation: only the `MonitoringAgent` can instantiate `ReportingAgent` instances
- Direct link between nodes and `ReportingAgent` for real-time status updates
- Supports `local-signal` and `global-signal` options, sending notifications back to `MonitoringAgent`
- Maintains a record of all status updates within `MonitoringAgent`, ensuring complete status history

### 5. MonitoringAgent
**Primary Role**: Central coordinator for node status tracking and external signal broadcasting
- Manages creation and lifecycle of all `ReportingAgent` instances, responding to node requests for monitoring
- Collects status updates from `ReportingAgents` and tracks aggregated statuses across the entire chain
- Broadcasts status signals externally, enabling integration with remote monitoring systems

**Key Features & Summary**:
- Singleton structure for consistent, centralized tracking
- Configurable callback functions for handling reports and broadcasts
- Aggregates and maintains comprehensive chain status data
- Supports remote host configuration for scalable, distributed monitoring
- Direct signal broadcasting capability to relay critical node updates externally


# Component Flows and Relationships

## Component Relationships
```
  NodeSupervisor
      ↓ manages
      Node ←→ ReportingAgent
          ↓ contains
          [Pipeline 1 || Pipeline n]
          ↓ executes
              [PipelineProcessor 1, PipelineProcessor n]
              ↓ executes
              External Service
      ↑ monitored by
      MonitoringAgent
```

## Data Flows

### 1. Chain Initialization
The `NodeSupervisor` oversees chain initialization by setting up configurations and distributing nodes. Nodes request a `ReportingAgent` from the `MonitoringAgent` as needed.

```
  NodeSupervisor
  → Creates Chain Configuration
  → Distributes Nodes (Local/Remote)
  → Configures Monitoring via MonitoringAgent
```

### 2. Execution Flow
Each `Node` operates on incoming data, using `PipelineProcessor` for processing and communicating with external services as necessary. Status updates are continuously sent to `MonitoringAgent` via `ReportingAgent`.

```
  Node
  → Receives Data
  → Processes Data with PipelineProcessor
  → Reports Status Updates via ReportingAgent
  → Forwards Data to Next Node
```

### 3. Monitoring Flow
The `ReportingAgent` captures status changes in each node and communicates them to the `MonitoringAgent`, which aggregates the updates and broadcasts chain-level status externally as needed.

```
  ReportingAgent
  → Captures Node Status Changes
  → Reports Status to MonitoringAgent
  MonitoringAgent
  → Aggregates Status Updates
  → Broadcasts Chain-Level Status to Remote Systems
```


# Typical Workflow Example

1. Configuration of connectors
2. Creation of a chain
3. Preparation of chain distribution
4. Chain startup
5. Execution and monitoring

# Error Handling and Logging

The library uses a logging system to track operations and errors.

# Conclusion

The DPCP library offers a flexible solution for managing distributed data processing chains. It provides tools for configuration, execution, monitoring, and error management in processing workflows.

