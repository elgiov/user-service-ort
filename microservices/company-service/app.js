"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const companyRoutes_1 = __importDefault(require("./routes/companyRoutes"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(function (req, res, next) {
    //Enabling CORS
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.header('Access-Control-Allow-Headers', 'Referrer-Policy, Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization, cache-control');
    //res.header("Cache-Control", "no-cache, no-store");
    //res.header("Pragma", "no-cache");
    next();
});
app.use('/api/companies', companyRoutes_1.default);
/*app.post('/add', companyController.createCompany);
app.get('/', companyController.getCompanies);
app.get('/:id', companyController.getCompanyById);

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
*/
app.listen(3002, () => console.log('Company service is listening on port 3002'));
