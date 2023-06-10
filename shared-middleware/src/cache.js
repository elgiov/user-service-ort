"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setexAsync = exports.setAsync = exports.getAsync = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const redisUrl = 'redis://default:SLOMhNOkEpFCUqGgpOXNkyeoXvv2NbaJ@redis-14605.c17.us-east-1-4.ec2.cloud.redislabs.com:14605';
const client = new ioredis_1.default(redisUrl, {
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
exports.getAsync = client.get.bind(client);
exports.setAsync = client.set.bind(client);
exports.setexAsync = client.setex.bind(client);
