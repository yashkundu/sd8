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
            // service-name which will be used in name resolution, if this is
            // not provided the main name field's value will be used.
            "name": "postService"  
        }
    }

```

## Usage   

### Creating a Sd8 instance
It will take an options object of type [Sd8Opts](./src/interfaces/index.ts) as its parameter.\
All three properties of options object are optional :

#### dialTimeout

Specifies for how much time (in seconds) the module will wait for connection to etcd before timing out. Default is 30sec.

#### hosts

A string or an array of strings which tells the etcd hosts url. Default is '127.0.0.1:2379'.

#### minTtl

Specifies the minimum time to live (in seconds) for all keys. Ttl less than this will be converted to minTtl. Default is 30sec.


```code
    import Sd8 from 'sd8'

    const sd8 = new Sd8({
        dialTimeout: 30,
        hosts: '127.0.0.1:2379',
        minTtl: 30
    })
```

### Registering a service

std8.register takes time to live for this service (in service registry) as a parameter.\
Throws error in case of failure.

```code
    await sd8.register(20)
```

#### No Failure detection
if **ttl is zero or not provided**, then it will register only once, so even if after some time the service incurrs some problem and fails, the service discovery won't be able to detect that failure.

#### Failure detection
if **non zero ttl is provided** then, the entriy of this service (in service registry) will expire in ttl seconds, and the discovery will automatically refresh the lease in that time period to convey the information that this service is running properly. 

### Watching a service
If I have to resolve some service's name to its ip address then we have to watch it first.

#### watchOne
Only watches and add a single service to the inmemory resolver (sd8.dns) .\
Can be used in cases where only some services has to be called from the current service.

```code
    await sd8.watchOne('post')
```

#### watchAll
Watches all the services which are defined in the registry associated with the current Sd8 instance and adds all those services to the inmemory resolver (sd8.dns) .\
Can be used in a api gateway or reverse proxy where all services has to be called.

```code
    await sd8.watchAll()
```

### Handler

watchOne and watchAll can takes one more optional argument that is a handler object with type Handler shown below.
```code
    interface Handler{
        onChange?(serviceName: string, newServiceUrl: string) : void;
        onDelete?(serviceName: string): void;
    }
```

Both onChange and onDelete functions are optional.\
**onChange** will be executed when the url of the service changes.\
**onDelete** will be executed when the url entry of that service is removed from registry in case of a failure or manual stoppage.\
Example
```code
    await sd8.watchOne('post', {
        onChange: (serviceName: string, newServiceUrl: string) => {
            console.log(`${serviceName} url changed to ${newServiceUrl}.`)
        },
        onDelete: (serviceName: string) => {
            console.log(`${serviceName} stopped.`)
        } 
    })
```

Similar in **watchAll**.

### Resolving service-names of watched services

For the services that we have watched (watchOne or watchAll), their service-name can be resolve to their ip address using **sd8.dns** by using its **resolve** method. This service-name resoltion is similar to how nameservers resolve domain names to ip addresses.

```code
    await sd8.dns.resolve('post')
```

It will return the ip address of the service, using which we can communicate with the service.\
If the service-name resolution is not possible (due to some failure in service or if the service is not running) it will throw an error.

#### P.S
sd8 because it functions like the no. 8 in football in some ways.