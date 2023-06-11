import express from 'express';
import cors from 'cors';
import productRoutes from './routes/productRoutes';
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

app.use('/api/products', productRoutes);
connectDB();

app.listen(3000, () => console.log('Product service is listening on port 3000'));
