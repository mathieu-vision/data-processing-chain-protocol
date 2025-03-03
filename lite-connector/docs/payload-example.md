# LiteConnector Documentation

### Starting the Connectors

```
node ./launch-connectors.js
```

or

```
./launch-connectors.sh
```

### Create and Start a Chain

**Endpoint:** `POST http://localhost:8887/chain/create-and-start`

This endpoint allows you to configure and start a chain in a single request.

#### Payload Examples

**Example 1: With metadata, resolver, and configuration**

```json
{
  "chainConfig": [
    {
      "services": [],
      "location": "local",
      "monitoringHost": "http://localhost:8887/"
    },
    {
      "services": [{"targetId": "service1", "meta":{"resolver": "http://localhost:8888/", "configuration":{"a": "some configuration"}}}],
      "location": "remote"
    }
  ],
  "data": {
      "hello": "here the data"
   }
}
```

**Example 2: With metadata and resolver for multiple services**

```json
{
  "chainConfig": [
    {
      "services": [],
      "location": "local",
      "monitoringHost": "http://localhost:8887/"
    },
    {
      "services": [
        {
          "targetId": "http://localhost:8888/service1",
          "meta": {
            "configuration": {
              "a": "some configuration"
            }
          }
        }
      ],
      "location": "remote"
    },
    {
      "services": [
        {
          "targetId": "service2",
          "meta": {
            "resolver": "http://localhost:8889/",
            "configuration": {
              "a": "some configuration"
            }
          }
        }
      ],
      "location": "remote"
    },
    {
      "services": [
        "http://localhost:8890/service3"
      ],
      "location": "remote"
    }
  ],
  "data": {
    "hello": "here the data"
  }
}
```

**Example 3: With metadata for some services**

```json
{
  "chainConfig": [
    {
      "services": [],
      "location": "local",
      "monitoringHost": "http://localhost:8887/"
    },
    {
      "services": [
        {
          "targetId": "http://localhost:8888/service1",
          "meta": {
            "configuration": {
              "a": "some configuration"
            }
          }
        }
      ],
      "location": "remote"
    },
    {
      "services": [
        "http://localhost:8889/service2"
      ],
      "location": "remote"
    },
    {
      "services": [
        "http://localhost:8890/service3"
      ],
      "location": "remote"
    }
  ],
  "data": {
    "hello": "here another data"
  }
}
```

**Example 4: Simple configuration with direct service URLs**

```json
{
  "chainConfig": [
    {
      "services": [],
      "location": "local",
      "monitoringHost": "http://localhost:8887/"
    },
    {
      "services": ["http://localhost:8888/service1"],
      "location": "remote"
    },
    {
      "services": ["http://localhost:8889/service2"],
      "location": "remote"
    },
    {
      "services": ["http://localhost:8890/service3"],
      "location": "remote"
    }
  ],
  "data": {
      "hello": "here the data"
   }
}
```

---

## Using Signal Status

### Start Connectors with Signal Type

```
node ./launch-connectors.js --type 1
```
or 

```
./launch-connectors.sh --type 1
```

### Deploy and Start Chain with a Suspended Node

**Endpoint:** `POST http://localhost:8887/chain/create-and-start`

```json
{
  "chainConfig": [
    {
      "services": [],
      "location": "local",
      "monitoringHost": "http://localhost:8887/"
    },
    {
      "services": ["http://localhost:8888/service1"],
      "signalQueue": ["node_suspend"],
      "location": "remote"
    }
  ],
  "data": {
      "hello": "here the data"
   }
}
```

### Resume Remote Node from Deployment Host

**Endpoint:** `POST http://localhost:8887/node/resume`

```json
{
    "hostURI": "http://localhost:8888/",
    "chainId": "chain-id-returned-by-previous-request",
    "targetId": "http://localhost:8888/service1"
}
```

### Resume Local Node from Service Host

**Endpoint:** `POST http://localhost:8888/node/resume`

```json
{
    "chainId": "chain-id-returned-by-previous-request",
    "targetId": "http://localhost:8888/service1"
}
```

Note: The same approach can be used with `POST http://localhost:8888/node/suspend`

---

## Legacy Example (LiteConnector.0)

### Start Legacy Connectors

```
node ./launch-connectors.js --type 0
```

or

```
./launch-connectors.sh --type 0
```

### Step 1: Configure Service-Connector Mappings

**Endpoint:** `POST http://localhost:8887/dispatch-config`

```json
[
    {
        "targetUID": "service1",
        "connectorURI": "http://localhost:8888"
    },
    {
        "targetUID": "service2",
        "connectorURI": "http://localhost:8889"
    },
    {
        "targetUID": "service3",
        "connectorURI": "http://localhost:8890"
    }
]
```

### Step 2: Create the Chain

**Endpoint:** `POST http://localhost:8887/chain/create`

```json
{
  "chainConfig": [
    {
      "services": [],
      "location": "local",
      "monitoringHost": "http://localhost:8887/"
    },
    {
      "services": ["service1"],
      "location": "remote"
    },
    {
      "services": ["service2"],
      "location": "remote"
    },
    {
      "services": ["service3"],
      "location": "remote"
    }
  ]
}
```

**Example Response:**

```json
{
    "chainId": "@supervisor:connector-initiator-1729245122163-167e4322"
}
```

### Step 3: Start the Chain

**Endpoint:** `PUT http://localhost:8887/chain/start`

```json
{
    "chainId": "@supervisor:connector-initiator-1729245122163-167e4322",
    "data": {
        "hello": "here the data"
    }
}
```
