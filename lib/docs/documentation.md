# Technical Documentation for the DPCP Library (Data Processing Chain Protocol)

## Introduction

The DPCP library is designed to manage distributed data processing chains. It enables the creation, configuration, and execution of processing chains across multiple connectors. This library allows for the creation and supervision of data transformation process chains, with these processes encapsulated in execution nodes.

## Main Components

### 1. NodeSupervisor

Central component that manages the entire data processing chains.

Features:
- Creation and management of nodes
- Configuration of processing chains
- Execution of processing chains
- Management of communications between local and remote nodes

### 2. Node

Represents an individual node in the processing chain.

Characteristics:
- Unique identifier
- Processing pipelines
- State (waiting, in progress, completed, etc.)
- Has an intput and output
- Executable
- It is a chain link

### 3. PipelineProcessor

Unit that manages data processing within a Pipeline of a node.

Characteristics:
- Retrieves the data, the targetId of the service to be called, and a configuration header usually passed via the data attribute
- Execution of a processing service via the associated processing service (given by targetId)
- Or data transformation via the associated processing service (given by targetId)

### 4. NodeMonitoring (wip)

Unit for monitoring the state and progress of nodes in a chain.

Characteristics:
- Tracking node states
- Updating node status
- Verifying the possibility of executing a node

### 5. ProgressTracker (wip)

Tracks the overall progress of chain execution.

## Typical Workflow

1. Configuration of connectors
2. Creation of a chain
3. Preparation of chain distribution
4. Chain startup
5. Execution and monitoring

## Execution Chain

1. Initial launch:
   - Chain creation is initiated by an initial connector generally the provider of the initial data.
   - Deployment therefore begins locally.

2. Distribution:
   - The chain is then dispatched to remote nodes.

3. Connector configuration:
   - Each connector supporting chains requires a communication endpoint.
   - Behind this endpoint is a controller linking the node supervisor.

4. Execution:
   - Nodes execute their processing pipelines.
   - Each node can contain one or more execution pipelines.
   - Pipelines can execute in parallel.
   - Pipelines describe series of executable processes through which data passes.

## Controller functionalities:
1. Setup: 
   - Instantiates and prepares nodes on the target connector.

2. Run: 
   - Launches the execution of a node on the target connector.
   - Currently uses the targetId in relation to the first processor of the target node.

3. Signal management (wip): 
   - Allows sending specific signals to nodes.
   - Example: suspend or resume node execution.

4. Feedback management (todo):
   - Implements logic to manage feedback on node availability.
   - Checks availability of remote connectors before execution.
   - More advanced management of relationships between connectorId, chainId, and targetId.

## Error Handling and Logging

The library uses a logging system to track operations and errors.

## Conclusion

The DPCP library offers a flexible solution for managing distributed data processing chains. It provides tools for configuration, execution, monitoring, and error management in processing workflows.