import express from 'express';
import { connectDB } from './config';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import purchaseRoutes from './routes/purchaseRoutes';
import saleRoutes from './routes/saleRoutes';
import { errorHandler } from './middlewares/errorHandler';
import providerRoutes from './routes/providerRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(errorHandler);
app.use(function (req, res, next) {
    //Enabling CORS
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization, cache-control");
    res.header("Cache-Control", "no-cache, no-store");
    res.header("Pragma", "no-cache");
    next();
});
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/providers', providerRoutes);


// Connect to the MongoDB database
connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export { app };
