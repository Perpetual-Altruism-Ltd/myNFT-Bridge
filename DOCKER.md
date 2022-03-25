# Dockerisation of Bridge

In this document you will find documentation on how to run the bridge in container.

## Bridge Frontend

* Set the configuration [file](Codebase/Bridge_Frontend/conf.json)
```
//Build the image
docker build -t mynft-frontend .
// run the image
docker run -p 8080:8080 mynft-frontend
```
Your container is available at [localhost:8080](http://localhost:8080)

## Relay

* Set the configuration [file](Codebase/Relay/conf.json) according to [this](RELAY.md) (will require some resources)
```
//Build the image
docker build -t bridge-relay .
// run the image
docker run bridge-relay
```
