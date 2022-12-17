interface Sd8Opts {
    dialTimeout?: number;       // in seconds (default : 30sec)
    hosts?: string[] | string;      // default 127.0.0.1:2379
    minTtl?: number             // minimum time to live for all the keys (defaults 30sec)
}

interface Handler{
    onChange?(serviceName: string, newServiceUrl: string) : void;
    onDelete?(serviceName: string): void;
}

export {Sd8Opts, Handler}