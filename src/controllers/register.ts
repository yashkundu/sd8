import { Etcd3 } from "etcd3"
import { getServiceKey } from "../utils"

const register = async (serviceName: string, url: string,  ttl: number, delta: number, etcd: Etcd3) => {

    const registerService = async () => {
        await etcd.put(serviceName).value(url).exec()
    }

    const registerServiceWithLease = async () => {
        try {
            const lease = etcd.lease(ttl as number, {autoKeepAlive: false})
            await lease.put(getServiceKey(serviceName)).value(url).exec()

            const keepAlive = async () => {
                try {
                    await lease.keepaliveOnce()
                    setTimeout(keepAlive, (ttl-delta)*1000)
                } catch (error) {
                    console.log(`${serviceName} failed to update its lease in the registry`)
                    throw error
                }
            }
            setTimeout(keepAlive, (ttl-delta)*1000);
            console.log(`${serviceName} registered to registry`);
        } catch (error) {
            console.log(`${serviceName} failed to register to registry`);
            throw error
        }
    }

    try{
        if(ttl==0) await registerService()
        else await registerServiceWithLease()
    } catch(error) {
        throw error
    }
}


export {register}