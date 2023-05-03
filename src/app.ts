import express from 'express';
import { connectDB } from './config';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import purchaseRoutes from './routes/purchaseRoutes';
import saleRoutes from './routes/saleRoutes';
import { errorHandler } from './middlewares/errorHandler';
import providerRoutes from './routes/providerRoutes';
import companyRoutes from './routes/companyRoutes';
import inviteRoutes from './routes/inviteRoutes';
import cors from 'cors';
import { logger } from './config/logger';
import healthRoutes from './routes/healthRoutes';
import { responseTimes, register, requestsPerMinute } from './metrics';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    const startTime = Date.now();
    res.on('finish', async () => {
        const elapsedTime = Date.now() - startTime;
        responseTimes.observe(elapsedTime);
        requestsPerMinute.inc();
        logger.info(
            `Endpoint: ${req.method} ${req.originalUrl} - Response time: ${elapsedTime} ms - Status code: ${res.statusCode} - Requests per minute: ${
                (await requestsPerMinute.get()).values[0].value
            }`
        );
    });
    next();
});
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
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api', healthRoutes);

app.use(errorHandler);

connectDB();

app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});

export { app };
