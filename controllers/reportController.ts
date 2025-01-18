import { Request, Response, NextFunction } from 'express';
import Bill from '../models/bill';
import Employee from '../models/employee';

export const generateSalesReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const bills = await Bill.find({
      date: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      },
    }).populate('employeeId', 'name');

    const totalSales = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const salesByEmployee = bills.reduce<Record<string, number>>((acc, bill) => {
      const employeeName = (bill.employeeId as any).name;
      acc[employeeName] = (acc[employeeName] || 0) + bill.amount;
      return acc;
    }, {});

    res.status(200).json({ totalSales, salesByEmployee, bills });
  } catch (error) {
    next({ status: 400, message: 'Error generating sales report', error });
  }
};

export const generateEmployeeReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const employees = await Employee.find();
    const employeeReports = await Promise.all(
      employees.map(async (employee) => {
        const bills = await Bill.find({ employeeId: employee._id });
        const totalSales = bills.reduce((sum, bill) => sum + bill.amount, 0);
        const billCount = bills.length;
        return {
          employee: employee.name,
          totalSales,
          billCount,
          averageSalePerBill: billCount ? totalSales / billCount : 0,
        };
      })
    );
    res.status(200).json(employeeReports);
  } catch (error) {
    next({ status: 400, message: 'Error generating employee report', error });
  }
};
