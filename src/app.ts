import express from 'express';
import { connectDB } from './config';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);


// Connect to the MongoDB database
connectDB();

// Add your routes here

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export { app };
