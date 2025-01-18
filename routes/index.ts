import express, { Router } from 'express';
import { createEmployee, getEmployees, getEmployee, updateEmployee, deleteEmployee } from '../controllers/employeeController';
import { createBill, getBills } from '../controllers/billController';
import { generateSalesReport, generateEmployeeReport } from '../controllers/reportController';
import { createService, getServices, getService, updateService, deleteService } from '../controllers/serviceController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { employeeSchema, serviceSchema, billSchema } from '../validations/schemas';
import authRoutes from './auth';

// Create a router instance
const router: Router = express.Router();

// Auth routes
router.use('/auth', authRoutes);

// Protected routes - ensure token authentication
router.use(authenticateToken);

// Employee routes
router.post(
  '/employees',
  validateRequest(employeeSchema),
  createEmployee,
);
router.get('/employees', getEmployees);
router.get('/employees/:id', getEmployee);
router.put(
  '/employees/:id',
  validateRequest(employeeSchema),
  updateEmployee,
);
router.delete('/employees/:id', deleteEmployee);

// Bill routes
router.post('/bills', validateRequest(billSchema), createBill);
router.get('/bills', getBills);

// Report routes
router.get('/reports/sales', generateSalesReport);
router.get('/reports/employees', generateEmployeeReport);

// Service routes
router.post(
  '/services',
  validateRequest(serviceSchema),
  createService,
);
router.get('/services', getServices);
router.get('/services/:id', getService);
router.put(
  '/services/:id',
  validateRequest(serviceSchema),
  updateService,
);
router.delete('/services/:id', deleteService);

// Export the router
export default router;