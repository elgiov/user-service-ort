import express from 'express';
import { connectDB } from './config';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import purchaseRoutes from './routes/purchaseRoutes';
import saleRoutes from './routes/saleRoutes';
import { errorHandler } from './middlewares/errorHandler';
import providerRoutes from './routes/providerRoutes';
import companyRoutes from './routes/companyRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(errorHandler);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/companies', companyRoutes);



// Connect to the MongoDB database
connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export { app };
