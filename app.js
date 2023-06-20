"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const inviteRoutes_1 = __importDefault(require("./routes/inviteRoutes"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("../user-service/src/database");
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const port = process.env.PORT || 3005;
app.use(function (req, res, next) {
    //Enabling CORS
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.header('Access-Control-Allow-Headers', 'Referrer-Policy, Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization, cache-control');
    next();
});
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            path: req.originalUrl,
            duration: duration,
            status: res.statusCode,
            date: new Date()
        };
        axios_1.default.post('https://monitoring-service-gestion-inv-839ff0fe87a7.herokuapp.com/log', logData).catch((err) => console.error(err));
    });
    next();
});
app.use('/api/users', userRoutes_1.default);
app.use('/api/invites', inviteRoutes_1.default);
(0, database_1.connectDB)();
app.listen(port, () => console.log('User service is listening on port 3005'));
