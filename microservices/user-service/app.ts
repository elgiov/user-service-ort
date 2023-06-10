import express from 'express';
import userRoutes from './routes/userRoutes';
import inviteRoutes from './routes/inviteRoutes';
import cors from 'cors';
import { connectDB } from '../user-service/src/database';

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

app.use('/api/users', userRoutes);
app.use('/api/invites', inviteRoutes);

connectDB();

app.listen(3005, () => console.log('User service is listening on port 3005'));
