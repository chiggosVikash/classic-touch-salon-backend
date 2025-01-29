import { Request, Response, NextFunction } from 'express';
import Bill, { IBill } from '../models/bill';
import { sendEmail } from '../utils/emailService';
import Employee from '../models/employee';
import Service from '../models/service';

export const createBill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {employeeId,tipAmount,discountAmount,paymentMode,paymentDate,serviceIds,customerName,customerPhoneNumber} = req.body;

    const serviceObjects = await Service.find({ _id: { $in: serviceIds } });
    const subtotal = serviceObjects.reduce((sum, service) => sum + service.amount, 0);
    const amount = subtotal - discountAmount;

    const bill = new Bill({
      employeeId,
      serviceIds,
      amount,
      tipAmount,
      discountAmount,
      paymentMode,
      date: paymentDate,
      customerName,
      customerPhoneNumber,
    });
    await bill.save();

    const employee = await Employee.findById(bill.employeeId);
    if (!employee) {
      return next({ status: 404, message: 'Employee not found' });
    }

    // await sendEmail({
    //   to: employee.email,
    //   subject: 'New Bill Generated',
    //   text: `A new bill of $${bill.amount} has been generated for your services.`,
    //   html: `
    //     <h1>New Bill Generated</h1>
    //     <p>A new bill has been generated for your services:</p>
    //     <ul>
    //       <li>Subtotal: $${subtotal}</li>
    //       <li>Discount: $${discountAmount}</li>
    //       <li>Tip: $${tipAmount}</li>
    //       <li>Total Amount: $${amount}</li>
    //       <li>Payment Method: ${paymentMode}</li>
    //       <li>Date: ${paymentDate}</li>
    //       <li>Services: ${serviceObjects.map((s) => s.name).join(', ')}</li>
    //     </ul>
    //   `,
    // });

    res.status(201).json(bill);
  } catch (error) {
    next({ status: 400, message: 'Error creating bill', error });
  }
};

export const getBills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bills = await Bill.find()
      .populate('employeeId', 'name')
      .populate('services', 'name amount');
    res.status(200).json(bills);
  } catch (error) {
    next({ status: 400, message: 'Error fetching bills', error });
  }
};
