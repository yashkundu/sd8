# 📘sd8 - A minimal service discovery nodeJs module

A [server-side service discovery](https://microservices.io/patterns/server-side-discovery.html) npm package which can be used in any nodejs microservice to provide functionalities like dynamic name resolution (resolving service-name to its address), health checking and failure detection. Uses [etcd](https://etcd.io/) as a service registry.

## Why service discovery

In a microservice architecture, services might need to call each other (using REST or RPC) but ip addresses of these services can't be hardcoded because they can be dynamic and can change (like if a service fails and restarts then it might be assigned a different ip address in a cluster).\
Service discovery provide a [dns (Domain Name System)](https://en.wikipedia.org/wiki/Domain_Name_System) like system, which stores the dynamic mapping of service-names to their corresponding ip addresses.\
Every discoverable service registers in this registry, so it can be discovered by other services and can be accessed only by using its name.

## Installation

Install sd8 with npm

```bash
  npm install sd8
```
 
## Configuration

A service which has to be discovered will have to add the sd8 field as mentioned below in the package.json file present in its root directory.

```code
    {
        "name": "post",
        "version": "1.0.0",
        "sd8": {
             // other services can communicate with it using this url   
            "url": "http://localhost:3000",  
            // service-name which will be used in name resolution, if
            // this is not provided the main name field's value will be used.
            "name": "postService"  
        }
    }

```

## Usage   