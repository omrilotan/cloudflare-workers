# Rollout

This service is responsible for rolling out new versions of the application according to the rollout value in KV "rollout"

According to the value in KV and a random number between 1-100, this service will relay the traffic to either "traffic-logger" or "traffic-logger-canary" service.

```mermaid
graph TD
  subgraph traffic-logger
    A(traffic-logger deploy)
    A--main branch-->B[traffic-logger]
    A--side branch-->C[traffic-logger-canary]
  end
  E(HTTP Reqeusts)==>D[Rollout service]
  D==>E{{Rollout KV: canary}}
  D==yes==>C
  D==no==>B
```
