import express from 'express';
import bodyParser from 'body-parser';
import { createSale, getSales, getSalesByProduct } from './services/saleService';

const app = express();
app.use(bodyParser.json());

app.get('/api/sales', async (req, res) => {
    try {
        const company = req.query.company as string;
        const page = parseInt((req.query.page as string) || '1');
        const limit = parseInt((req.query.limit as string) || '10');
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        const sales = await getSales(company, page, limit, startDate, endDate);
        res.json(sales);
    } catch (error) {
        res.status(500).send({ error: (error as Error).message });
    }
});

app.post('/api/sales', async (req, res) => {
    try {
        const sale = await createSale(req.body.company, req.body.products, req.body.client);
        res.json(sale);
    } catch (error) {
        res.status(400).send({ error: (error as Error).message });
    }
});

app.get('/api/sales', async (req, res) => {
    try {
        const company = req.query.company as string;
        const page = parseInt((req.query.page as string) || '1');
        const limit = parseInt((req.query.limit as string) || '10');
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        const sales = await getSales(company, page, limit, startDate, endDate);
        res.json(sales);
    } catch (error) {
        res.status(500).send({ error: (error as Error).message });
    }
});

app.get('/api/sales/top-products/:company', async (req, res) => {
    try {
        const company = req.params.company;
        const startDate = new Date(req.query.startDate as string);
        const endDate = new Date(req.query.endDate as string);

        const salesByProduct = await getSalesByProduct(company, startDate, endDate);
        res.json(salesByProduct);
    } catch (error) {
        res.status(500).send({ error: (error as Error).message });
    }
});

app.listen(3001, () => console.log('Sale service is listening on port 3001'));
