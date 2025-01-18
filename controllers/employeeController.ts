import { Request, Response, NextFunction } from 'express';
import Employee, { IEmployee } from '../models/employee';

export const createEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const employee = new Employee(req.body as IEmployee);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    next({ status: 400, message: 'Error creating employee', error });
  }
};

export const getEmployees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    next({ status: 400, message: 'Error fetching employees', error });
  }
};

export const getEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return next({ status: 404, message: 'Employee not found' });
    }
    res.status(200).json(employee);
  } catch (error) {
    next({ status: 400, message: 'Error fetching employee', error });
  }
};

export const updateEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!employee) {
      return next({ status: 404, message: 'Employee not found' });
    }
    res.status(200).json(employee);
  } catch (error) {
    next({ status: 400, message: 'Error updating employee', error });
  }
};

export const deleteEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return next({ status: 404, message: 'Employee not found' });
    }
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    next({ status: 400, message: 'Error deleting employee', error });
  }
};
