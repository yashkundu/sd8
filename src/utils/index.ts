const COMMON_PREFIX = 'sd8/'

const getServiceKey = (serviceName: string) => {
    return (COMMON_PREFIX + serviceName)
}

export {getServiceKey, COMMON_PREFIX}