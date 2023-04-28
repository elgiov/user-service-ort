import { Router } from 'express';
import companyController from '../controllers/companyController';

const router = Router();

router.post('/add', companyController.createCompany);
router.get('/', companyController.getCompanies);
router.get('/:id', companyController.getCompanyById);

export default router;
