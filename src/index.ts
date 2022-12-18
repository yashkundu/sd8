import { Etcd3 } from "etcd3";
import { register as registerService } from "./controllers/register";
import { Registry } from "./registry";
import { getOne, getAll } from "./controllers/get";
import { watchOne as watchOneService, watchAll as watchAllServices } from "./controllers/watch";
import { Sd8Opts, Handler } from "./interfaces";
import { putHandlerGenerator, deleteHandlerGenerator } from "./handlers";
import { getServiceKey } from "./utils";


class Sd8 {

    private dialTimeout: number;
    private hosts: string[] | string;
    private etcd: Etcd3;
    private minTtl: number;
    private serviceUrl?: string;
    private serviceName?: string;
    private _serviceRegistry!: Registry;

    dns = {
        resolve: (serviceName: string) => {
            const serviceUrl = this.serviceRegistry.get(getServiceKey(serviceName))
            if(!serviceUrl) throw new Error('Cannot resolve the service name')
            return serviceUrl
        }
    }

    private get serviceRegistry() {
        if(!this._serviceRegistry) this._serviceRegistry = new Registry()
        return this._serviceRegistry
    };

    constructor(opts: Sd8Opts) {
        this.dialTimeout = (opts.dialTimeout) || 30
        this.minTtl = (opts.minTtl) || 30
        this.hosts = (opts.hosts) || '127.0.0.1:2379'
        this.etcd = new Etcd3({dialTimeout: this.dialTimeout, hosts: this.hosts})
        this.serviceUrl = process.env.npm_package_sd8_url
        this.serviceName = process.env.npm_package_sd8_name || process.env.npm_package_name
    }

    // ttl - 0 (no expiration of keys)
    async register(ttl?: number) {
        if(ttl) {
            if(!Number.isInteger(ttl)) throw new Error('Not a valid ttl.')
            ttl = Math.max(ttl, this.minTtl)
        }  
        if(!ttl) ttl = 0
        if(!this.serviceUrl) throw new Error('Service url not provided.')
        if(!this.serviceName) throw new Error('Service name not provided.')
        await registerService(this.serviceName, this.serviceUrl, ttl, 5, this.etcd)
    }

    async watchOne(serviceName: string, handler?: Handler) {
        if(!handler) handler = {}
        const serviceUrl = await getOne(serviceName, this.etcd)
        this.serviceRegistry.put(getServiceKey(serviceName), serviceUrl as string)

        const emitter = await watchOneService(serviceName, this.etcd)
        emitter.on('put', putHandlerGenerator(handler, this.serviceRegistry))
        emitter.on('delete', deleteHandlerGenerator(handler, this.serviceRegistry))
    }

    async watchAll(handler?: Handler) {
        if(!handler) handler = {}
        const mp = await getAll(this.etcd)
        mp.forEach(({key, value}) => {
            this.serviceRegistry.put(key, value)
        })

        const emitter = await watchAllServices(this.etcd)
        emitter.on('put', putHandlerGenerator(handler, this.serviceRegistry))
        emitter.on('delete', deleteHandlerGenerator(handler, this.serviceRegistry))
    }
}

export default Sd8