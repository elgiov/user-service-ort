import Redis from 'ioredis';

const redisUrl = 'redis://default:SLOMhNOkEpFCUqGgpOXNkyeoXvv2NbaJ@redis-14605.c17.us-east-1-4.ec2.cloud.redislabs.com:14605';
const client = new Redis(redisUrl, {
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 5000);
        console.log(`Redis retry attempt ${times}, retrying in ${delay} ms`);
        return delay;
    }
});

console.log('Connecting to Redis...');
client.on('connect', () => {
    console.log('Connected to Redis');
});

client.on('error', (error) => {
    console.error(`Redis error: ${error}`);
});

export const getAsync = client.get.bind(client);
export const setAsync = client.set.bind(client);
export const setexAsync = client.setex.bind(client);
