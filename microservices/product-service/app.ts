import express from 'express';
import bodyParser from 'body-parser';
import { decreaseProductQuantity, getProductById } from './services/productService';

const app = express();
app.use(bodyParser.json());

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await getProductById(req.params.id);
        res.json(product);
    } catch (error: any) {
        res.status(404).send({ error: error.message });
    }
});

app.post('/api/products/:id/decrease-quantity', async (req, res) => {
    try {
        await decreaseProductQuantity(req.params.id, req.body.quantity);
        res.sendStatus(200);
    } catch (error: any) {
        res.status(400).send({ error: error.message });
    }
});

app.listen(3000, () => console.log('Product service is listening on port 3000'));
