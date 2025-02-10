# LiteConnector Example Usage via a Single Endpoint in One Step

### Start the connectors

```
./launch-connectors.sh --type 1
```

### **Endpoint to create the chain across all connectors**

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
        }
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
        }
      ],
      "location": "remote"
    }
  ],
  "data": {
      "hello": "here the input data"
   }
}
```
