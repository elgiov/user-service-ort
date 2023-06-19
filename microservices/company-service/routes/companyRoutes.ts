import { Router } from 'express';
import companyController from '../controllers/companyController';
import auth from '../../../shared-middleware/src/auth';
import env from 'dotenv';
env.config();
const router = Router();

router.post('/add', companyController.createCompany);
router.get('/', companyController.getCompanies);
router.get('/:id', companyController.getCompanyById);
router.get('/byName/:name', companyController.getCompanyByName);
//@ts-ignore
router.get('/report/:id', auth.verifyToken, companyController.getCompanyReport);


export default router;
