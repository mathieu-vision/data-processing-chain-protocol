# LiteConnector Example Usage via a Single Endpoint in One Step

### **Endpoint to create the chain across all connectors**

**POST**: `http://localhost:8887/chain/create-and-start`

**Payload** (basically, this is the chain):

```json
{
  "chainConfig": [
    {
      "services": [],
      "location": "local"
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
---

# LiteConnector.0 Example Usage in 3 Steps

### Step A: **Specific Endpoint for This Connector**

This endpoint allows dispatching the `targetUID` and `connectorURI` relations to all connectors running on localhost.

**POST**: `http://localhost:8887/dispatch-config`

**Payload**:

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

---

### Step B: **Endpoint to create the chain across all connectors**

**POST**: `http://localhost:8887/chain/create`

**Payload** (basically, this is the chain):

```json
{
  "chainConfig": [
    {
      "services": [],
      "location": "local"
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

### Example of return:

```json
{
    "chainId": "@supervisor:connector-initiator-1729245122163-167e4322"
}
```

---

### Step C: **Endpoint to start the chain**

**PUT**: `http://localhost:8887/chain/start`

**Payload** (the ID of the chain to execute and the input data):

```json
{
    "chainId": "@supervisor:connector-initiator-1729245122163-167e4322",
    "data": {
        "hello": "here the data"
    }
}
```
