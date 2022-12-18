import { Etcd3 } from "etcd3"
import { EventEmitter } from "events"
import { getServiceKey, COMMON_PREFIX } from "../utils"


const watchOne = async (serviceName: string, etcd:Etcd3) => {
    const watcher = new EventEmitter()
    try {
        const etcdWatcher = await etcd.watch().key(getServiceKey(serviceName)).create()
        etcdWatcher.on('put', (kv) => {
            watcher.emit('put', kv)
        }).on('delete', (kv) => {
            watcher.emit('delete', kv)
        })
        console.log(`Successfully watching ${serviceName}`);
        return watcher
    } catch (error) {
        console.log(`Failed to watch ${serviceName}`);
        throw error
    }
}

const watchAll = async (etcd:Etcd3) => {
    const watcher = new EventEmitter()
    try {
        const etcdWatcher = await etcd.watch().prefix(COMMON_PREFIX).create()
        etcdWatcher.on('put', (kv) => {
            watcher.emit('put', kv)
        }).on('delete', (kv) => {
            watcher.emit('delete', kv)
        })
        console.log(`Successfully watching the services.`);
        return watcher
    } catch (error) {
        console.log(`Failed to watch the services.`);
        throw error
    }
}

export {watchOne, watchAll}