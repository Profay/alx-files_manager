import { createClient } from 'redis';

const client = createClient();


class RedisClient {
    constructor() {
        client.on('error', (err) => console.log("Redis client not connected to the server:", err));
    }

    isAlive() {
        return client.connected;
    }
    
    async get(key) {
        return new Promise((resolve, reject) => {
            client.get(key, (err, value) => {
            if (err) reject(err);
            else resolve(value);
            });
        });
    };

    async set(key, value, duration) {
        return new Promise((resolve, reject) => {
            client.set(key, value, 'EX', duration, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    };
 
    async del(key) {
        return new Promise((resolve, reject) => {
        client.del(key, (err, count) => {
            if (err) reject(err);
            else resolve(count);
            });
        });
    };   
}


const redisClient = new RedisClient;
module.exports = redisClient;
