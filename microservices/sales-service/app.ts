import express from 'express';
import saleRoutes from './routes/saleRoutes';
import cors from 'cors';
import { connectDB } from '../sales-service/src/database';

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
    next();
});

app.use('/api/sales', saleRoutes);
connectDB();

app.listen(3001, () => console.log('Sale service is listening on port 3001'));
