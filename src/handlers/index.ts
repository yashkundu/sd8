import { Handler } from "../interfaces";
import { IKeyValue } from "etcd3";
import { Registry } from "../registry";

const putHandlerGenerator = (handler: Handler, registry: Registry) => {
    return (kv: IKeyValue) => {
        const key = kv.key.toString()
        const value = kv.value.toString()
        const hasChanged = value!=registry.get(key)
        registry.put(key, value)
        if(hasChanged && handler.onChange) {
            handler.onChange(key, value)
        }
    }
}

const deleteHandlerGenerator = (handler: Handler, registry: Registry) => {
    return (kv: IKeyValue) => {
        const key = kv.key.toString()
        registry.del(key)
        if(handler.onDelete) {
            handler.onDelete(key)
        }
    }
}

export {putHandlerGenerator, deleteHandlerGenerator}