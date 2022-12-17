// In memory registry 


class Registry {
    private store: {[key: string]: string} = {};

    put(key: string, value: string) {
        this.store[key] = value;
    };

    del(key: string){
        if(this.store[key]) delete this.store[key];
    }

    get(key: string) {
        return this.store[key];
    }
}

export {Registry};