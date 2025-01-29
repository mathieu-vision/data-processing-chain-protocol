# Library Lifecycle and Monitoring Flow Documentation

## 1. Global Library Lifecycle Sequence Diagram

```mermaid
sequenceDiagram
    title Library Lifecycle Sequence Diagram
    participant User
    participant NodeSupervisor
    participant Node
    participant MonitoringAgent
    participant RemoteService

    User->>NodeSupervisor: Deploy Chain (config, data)
    NodeSupervisor->>NodeSupervisor: Create chain and store config
    NodeSupervisor->>Node: Setup first node (index=0)
    Node->>MonitoringAgent: Emit NODE_SETUP_COMPLETED (local-signal)
    MonitoringAgent->>MonitoringAgent: Update setupCounts[chainId]++
    
    loop For each node in chain
        alt Node location = local
            NodeSupervisor->>Node: Setup next local node
            Node->>MonitoringAgent: NODE_SETUP_COMPLETED
        else Node location = remote
            NodeSupervisor->>RemoteService: Broadcast setup signal
            RemoteService-->>NodeSupervisor: Node setup confirmation
        end
    end
    
    MonitoringAgent->>MonitoringSignalHandler: Check setupCounts[chainId] == totalNodes
    MonitoringSignalHandler->>NodeSupervisor: StartPendingChain(chainId)
    NodeSupervisor->>Node: Execute first node with data
    Node->>Node: Process data through pipelines
    alt Processing successful
        Node->>MonitoringAgent: NODE_COMPLETED
        Node->>NextNode: Send processed data
    else Processing failed
        Node->>MonitoringAgent: NODE_FAILED
        MonitoringAgent->>User: Send alert
    end
```

## 2. Monitoring/Reporting Flow Sequence Diagram

```mermaid
sequenceDiagram
    title Detailed Monitoring/Reporting Sequence Flow
    participant Node
    participant ReportingAgent
    participant MonitoringAgent
    participant HostResolver
    participant CallbackService
    participant MonitoringSignalHandler
    participant NodeSupervisor

    Node->>ReportingAgent: Emit signal (local/global)
    
    alt Signal Type = local-signal
        ReportingAgent->>MonitoringAgent: Update status Map
        MonitoringAgent-->>MonitoringAgent: Merge statuses
        MonitoringAgent->>MonitoringAgent: Check if critical status
        alt Critical status detected
            MonitoringAgent->>ReportingAgent: Trigger global-signal
        end
    else Signal Type = global-signal
        ReportingAgent->>MonitoringAgent: Handle callback
        alt Node index > 0 (Broadcast required)
            MonitoringAgent->>HostResolver: Get monitoringHost(chainId)
            HostResolver-->>MonitoringAgent: Return URL
            MonitoringAgent->>CallbackService: POST /notify
            CallbackService-->>MonitoringAgent: HTTP response
        else Node index = 0 (Direct handling)
            MonitoringAgent->>MonitoringSignalHandler: Handle(message)
            MonitoringSignalHandler->>MonitoringAgent: Get setupCounts[chainId]
            alt All nodes setup (setupCount >= total)
                MonitoringSignalHandler->>NodeSupervisor: startPendingChain(chainId)
                NodeSupervisor->>Node: Execute first node
            end
        end
    end
    
    loop Heartbeat monitoring
        MonitoringAgent->>Node: Status check
        Node-->>MonitoringAgent: Current status
        alt Status = NODE_FAILED
            MonitoringAgent->>NodeSupervisor: Restart node
        end
    end
```

## 3. Global Lifecycle Flowchart

```mermaid
flowchart TD
    A[Start: Chain Deployment] --> B[NodeSupervisor: Create Chain]
    B --> C[Setup First Node index 0]
    C --> D{Node Type?}
    D -->|Local| E[Initialize Local Node]
    D -->|Remote| F[Broadcast Setup Signal]
    
    E --> G[MonitoringAgent: Update setupCount]
    F --> H[Remote Service Confirmation]
    
    G --> I{All nodes setup?}
    H --> I
    I -->|Yes| J[Start Chain Execution]
    I -->|No| C
    
    J --> K[Node Processing]
    K --> L{Processing Result}
    L -->|Success| M[Send to Next Node]
    L -->|Failure| N[Alert & Retry]
    
    M --> O{More Nodes?}
    N --> O
    O -->|Yes| K
    O -->|No| P[End: Chain Complete]
```

## 4. Monitoring Flowchart

```mermaid
flowchart TD
    A[Node Status Change] --> B{Emit Signal Type?}
    B -->|local-signal| C[Update Local Status]
    B -->|global-signal| D[Process External Callback]
    
    C --> E[Store in status Map]
    E --> F{Is Critical Status?}
    F -->|Yes| G[Trigger Global Signal]
    F -->|No| H[Log Status]
    
    D --> I{Node Index > 0?}
    I -->|Yes| J[Resolve Monitoring Host]
    I -->|No| K[Direct Signal Handling]
    
    J --> L{Found Host?}
    L -->|Yes| M[POST /notify via CallbackService]
    L -->|No| N[Error: Host Resolution Failed]
    
    K --> O[Update setupCount]
    O --> P{setupCount >= Total Nodes?}
    P -->|Yes| Q[Start Pending Chain]
    P -->|No| R[Wait for More Nodes]
    
    subgraph Monitoring Agent
        S[Receive Signal] --> T{Signal Type?}
        T -->|NODE_SETUP_COMPLETED| U[Increment setupCount]
        T -->|NODE_FAILED| V[Trigger Alerts]
        U --> W{All Nodes Ready?}
        W -->|Yes| X[Signal Chain Start]
    end
    
    subgraph Host Resolution
        J --> Y[Check remoteMonitoringHost Map]
        Y --> Z[Return URL or Error]
    end
```

## Key Components Explanation

1. **Node**: The basic processing unit that executes pipelines and emits status signals
2. **ReportingAgent**: Mediator between Nodes and MonitoringAgent
3. **MonitoringAgent**: Central hub for status tracking and decision making
4. **HostResolver**: Resolves monitoring endpoints based on chain ID
5. **Callback Services** (Multiple Purposes):
   - *Reporting Callback* (`reportingCallback`): HTTP service for monitoring notifications
   - *Broadcast Callback* (`broadcastReportingCallback`): Distributed notifications across nodes
   - *Processor Callback* (`ProcessorCallback`): Encapsulates remote services in pipelines
   - *Setup Callback* (`broadcastSetupCallback`): Handles node initialization signals
6. **MonitoringSignalHandler**: Special handler for chain setup completion
7. **NodeSupervisor**: Orchestrates node lifecycle and chain execution

**Critical Decision Points:**
- `index > 0`: Determines if broadcast is needed (non-initiator nodes)
- `setupCount >= total`: Chain start condition check
- `Critical Status`: Determines if escalation is needed
- `Node Type`: Local vs remote handling differentiation

## Callback Services Taxonomy

| Callback Type          | Scope          | Protocol | Responsibility                          | Example Usage             |
|------------------------|----------------|----------|-----------------------------------------|---------------------------|
| ProcessorCallback      | Pipeline level | Any      | Remote service encapsulation            | Data transformation       |
| ReportingCallback      | Monitoring     | HTTP     | Node status notifications               | NODE_FAILED alerts        |
| BroadcastCallback      | Chain          | HTTP     | Cross-node communication                | Setup distribution        |
| SetupCallback          | Initialization | HTTP     | Node configuration broadcasting         | Chain deployment          |
