import { Etcd3 } from "etcd3"
import { getServiceKey, COMMON_PREFIX } from "../utils"

const getOne = async (serviceName: string, etcd:Etcd3) => {
    try {
        const res = await etcd.get(getServiceKey(serviceName)).string()
        return res
    } catch (error) {
        console.log(`Failed to get ${serviceName} service url`);
        throw error
    }
}

const getAll = async (etcd:Etcd3) => {
    try {
        const res = await etcd.getAll().prefix(COMMON_PREFIX).exec()
        const finalRes = res.kvs.map(kv => ({
            key: kv.key.toString(),
            value: kv.value.toString()
        }))
        return finalRes
    } catch (error) {
        console.log(`Failed to get the services urls`);
        throw error
    }
}

export {getOne, getAll}