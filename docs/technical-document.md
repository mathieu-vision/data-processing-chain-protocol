# Class Descriptions

## DataProcessingChain.ts

**Responsibility**: This class is the core of the library. It orchestrates the execution of the data processing chain.

### Features:
- Initializes the chain with the nodes (services) to be executed.
- Manages dependencies between the nodes.
- Coordinates the execution by calling the `NodeExecutor` for each node in the specified order.
- Provides an interface to start and control the processing workflow.

### Key Methods:
- `startChain(data: any): Promise<void>`: Starts the execution of the processing chain.
- `addNode(service: any): void`: Adds a node to the processing chain.
- `setProgressTracker(tracker: ProgressTracker): void`: Allows tracking of the progress.

---

## NodeExecutor.ts

**Responsibility**: This class executes the services (nodes) of the processing chain, taking input data and producing output results.

### Features:
- Executes individual services.
- Manages errors and exceptions during execution.
- Transfers data between nodes.

### Key Methods:
- `execute(service: any, inputData: any): Promise<any>`: Executes a given service with the provided data.
- `handleError(error: Error): void`: Handles errors that occur during execution.

---

## ProgressTracker.ts

**Responsibility**: Tracks and notifies the progress of the processing through the nodes in the chain.

### Features:
- Real-time notifications of progress status.
- Stores the current state of processing for reporting purposes.
- Manages alerts in case of blocking or issues within the chain.

### Key Methods:
- `notifyProgress(nodeId: string, status: string): void`: Notifies the progress status of a node.
- `getProgress(): any`: Returns the current state of progress.

---

## DataPipelineController.ts

**Responsibility**: Manages the flow of data between nodes, ensuring that data is properly transmitted from one service to another.

### Features:
- Transforms data between nodes if necessary.
- Applies specific transformation rules for each node.
- Coordinates the inputs/outputs of the nodes.

### Key Methods:
- `processData(input: any): Promise<any>`: Manages the processing of data between nodes.
- `transformData(data: any, nodeId: string): any`: Transforms the data according to the specifications of the node.
