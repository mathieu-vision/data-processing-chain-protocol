# Data Processing Chain Protocol Library

## Description

The DPCP (Data Processing Chain Protocol) library is a Node.js framework designed to facilitate the orchestration of distributed data processing workflows. It allows users to create and manage a hierarchical system of chains, nodes, and pipelines, enabling scalable and modular integration with external services. The library provides capabilities for monitoring, control, and error management, making it suitable for complex and distributed applications.

## Features

- Hierarchical Structure: Organizes processing workflows into chains, nodes, and pipelines for modularity and scalability.
- Node Lifecycle Management: Manages the creation, execution, and deletion of nodes, ensuring efficient operation.
- Flexible Chain Deployment: Supports dynamic deployment and distribution of chains across local and remote nodes.
- Signal Handling: Provides comprehensive signal management for precise control over node and chain actions.
- Status Monitoring: Utilizes a ReportingAgent for real-time status updates and monitoring of nodes.
- Data Processing: Executes multiple processing pipelines within nodes, allowing for both sequential and parallel execution.
- Integration with External Services: Facilitates communication with external APIs and services, including optional data transformation.
- Centralized Monitoring: The MonitoringAgent aggregates status updates and broadcasts them for external monitoring.
- Error Handling and Logging: Implements a logging system to track operations and manage errors effectively.
- Singleton Patterns: Ensures centralized management for components like NodeSupervisor and MonitoringAgent for consistency.

## Design Document
See the design document [here](docs/design-document.md).

## Building instructions
_Describe how to build the BB._

E.g.: `docker build -t <bb name>:latest .` or `npm install` 

## Running instructions
_Describe how to run the BB._

E.g.: `docker compose up` or `npm run`

## Example usage
_Describe how to check some basic functionality of the BB._
E.g.:

Send the following requests to the designated endpoints:
| Endpoint      | Example input | Expected output   |
| ------------- | ------------- | ----------------- |
| /hello        | World         | 200, Hello World! |
|               |               |                   |
|               |               |                   |

## Unit testing
### Setup test environment
### Run tests
### Expected results

## Component-level testing
### Setup test environment
### Run tests
### Expected results


## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.
