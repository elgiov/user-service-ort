import express from 'express';
import purchaseRoutes from './routes/purchaseRoutes';
import cors from 'cors';
import { connectDB } from '../purchase-service/src/database';


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

app.use('/api/purchases', purchaseRoutes);
connectDB();

app.listen(3004, () => console.log('Purchase service is listening on port 3004'));