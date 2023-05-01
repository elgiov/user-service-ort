import { collectDefaultMetrics, Counter, Histogram, register } from 'prom-client';

collectDefaultMetrics();

export const requestsPerMinute = new Counter({
    name: 'requests_per_minute',
    help: 'Number of requests per minute'
});

export const responseTimes = new Histogram({
    name: 'response_times',
    help: 'Response time of different endpoints',
    buckets: [50, 100, 200, 300, 400, 500, 1000, 2000]
});

export { register };
