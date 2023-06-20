import express from 'express';
import providerRoutes from './routes/providerRoutes';
import cors from 'cors';
import { connectDB } from '../provider-service/src/database';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

app.use(function (req, res, next) {
    //Enabling CORS
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.header(
        'Access-Control-Allow-Headers',
        'Referrer-Policy, Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization, cache-control'
    );
    //res.header("Cache-Control", "no-cache, no-store");
    //res.header("Pragma", "no-cache");
    next();
});

app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            path: req.originalUrl,
            duration: duration,
            status: res.statusCode,
            date: new Date()
        };

        axios.post('https://monitoring-service-gestion-inv-839ff0fe87a7.herokuapp.com/log', logData).catch((err) => console.error(err));
    });

    next();
});

app.use('/api/providers', providerRoutes);
connectDB();

app.listen(3003, () => console.log('Provider service is listening on port 3003'));