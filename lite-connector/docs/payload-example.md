# LiteConnector Example Usage via a Single Endpoint in One Step

### Start the connectors

```
./launch-connectors.sh
```



**POST**: `http://localhost:8887/chain/create-and-start`

**Payload Example parallel, with meta data, resolver and configuration*:

```json
{
  "chainConfig": [
    {
      "services": [],
      "location": "local",
      "monitoringHost": "http://localhost:8887/",
      "childMode": "parallel", // possible values "normal", "parallel", "undefined"
      "chainConfig": [
        {
          "services": [{"targetId": "service_0_0"}],
          "location": "local",
          "monitoringHost": "http://localhost:8888/"
        },
      ]
    },
    {
      "chainConfig": [
        {
          "services": [{
            "targetId": "service_1_0",
            "meta": {
              "configuration": {
                "a": "some configuration"
              }
            }
          }],
          "location": "local",
          "childMode": "normal", // "normal" same as if it was "undefined"
          "monitoringHost": "http://localhost:8889/"
        },
      ]
      "location": "remote"
    }
  ],
  "data": {
      "hello": "here the input data"
   }
}
```


### **Endpoint to create the chain across all connectors**

**POST**: `http://localhost:8887/chain/create-and-start`

**Payload Example 1, with meta data, resolver and configuration*:

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

**Payload Example 2, with meta data and resolver**:

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

**Payload Example 3, with meta data**:

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
    "hello": "here an other data"
  }
}

```

**Payload example 4**:

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

# LiteConnector.0 Example Usage in 3 Steps

### Start the connectors

```
./launch-connectors.sh --type 0
```

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
