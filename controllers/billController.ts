import { Request, Response, NextFunction } from "express";
import Bill from "../models/bill";
import Employee from "../models/employee";
import Service from "../models/service";
import mongoose from "mongoose";
import emailService from "../utils/emailService";

export const getBillById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const bill = await Bill.findById(id)
      .populate("employeeId", "name")
      .populate("serviceIds", "name");
    if (!bill) {
      return next({ status: 404, message: "Bill not found" });
    }
    res.status(200).json(bill);
  } catch (error) {
    next({ status: 400, message: "Error fetching bill", error });
  }
};

export const createBill = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      employeeId,
      tipAmount,
      discountAmount,
      paymentMode,
      paymentDate,
      serviceIds,
      customerName,
      customerPhoneNumber,
    } = req.body;

    const serviceObjects = await Service.find({ _id: { $in: serviceIds } });
    const subtotal = serviceObjects.reduce(
      (sum, service) => sum + service.amount,
      0
    );
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
      return next({ status: 404, message: "Employee not found" });
    }

    // Send email to owner
    emailService.sendPaymentReceivedNotification({
      amount: bill.amount,
      date: bill.paymentDate,
      serviceBy: employee.name,
      customerName: bill.customerName,
      customerPhone: bill.customerPhoneNumber,
    })

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
    console.log(error);
    next({ status: 400, message: "Error creating bill", error });
  }
};

export const updateBill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedBill = await Bill.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedBill) {
      return next({ status: 404, message: "Bill not found" });
    }
    res.status(200).json(updatedBill);
  } catch (e) {
    next({ status: 400, message: "Error updating bill", error: e });
  }
};

export const getBills = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bills = await Bill.find()
      .sort({ paymentDate: -1 })
      .populate("employeeId", "name")
      .populate("serviceIds", "name");
    res.status(200).json(bills);
  } catch (error) {
    console.log(error);
    next({ status: 400, message: "Error fetching bills", error });
  }
};

export const dashboardInsights = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1); // Start of current month
    const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0); // End of current month

    const insights = await Bill.aggregate([
      {
        $facet: {
          // ✅ Total Revenue
          totalRevenue: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$amount" },
              },
            },
          ],

          // ✅ Monthly Revenue
          monthlyRevenue: [
            {
              $addFields: {
                paymentDate: { $toDate: "$paymentDate" },
              },
            },
            {
              $match: {
                paymentDate: {
                  $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
                  $lt: new Date(`${currentYear + 1}-01-01T00:00:00.000Z`),
                },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m", date: "$paymentDate" },
                },
                monthlyRevenue: { $sum: "$amount" },
              },
            },
            {
              $sort: { _id: 1 },
            },
          ],

          // ✅ Today's Sales & Tips
          todaySalesAndTips: [
            {
              $addFields: {
                paymentDate: { $toDate: "$paymentDate" },
              },
            },
            {
              $match: {
                paymentDate: {
                  $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                  $lt: new Date(new Date().setHours(23, 59, 59, 999)),
                },
              },
            },
            {
              $group: {
                _id: null,
                todaySales: { $sum: "$amount" },
                todayTips: { $sum: "$tipAmount" },
              },
            },
          ],

          // ✅ Top Services Used
          topServices: [
            {
              $unwind: "$serviceIds",
            },
            {
              $group: {
                _id: "$serviceIds",
                count: { $sum: 1 },
              },
            },
            {
              $sort: { count: -1 },
            },
            {
              $limit: 3,
            },
            {
              $lookup: {
                from: "services",
                localField: "_id",
                foreignField: "_id",
                as: "serviceDetails",
              },
            },
            {
              $unwind: "$serviceDetails",
            },
            {
              $project: {
                serviceId: "$_id",
                serviceName: "$serviceDetails.name",
                count: 1,
              },
            },
          ],

          employeeOfTheMonth: [
            {
              $match: {
                paymentDate: {
                  $gte: startOfCurrentMonth,
                  $lt: endOfCurrentMonth,
                },
              },
            },
            {
              $group: {
                _id: "$employeeId",
                totalTips: { $sum: "$tipAmount" },
              },
            },
            {
              $sort: { totalTips: -1 },
            },
            {
              $limit: 1,
            },
            {
              $lookup: {
                from: "employees",
                localField: "_id",
                foreignField: "_id",
                as: "employeeDetails",
              },
            },
            {
              $unwind: "$employeeDetails",
            },
            {
              $project: {
                employeeId: "$_id",
                employeeName: "$employeeDetails.name",
                totalTips: 1,
              },
            },
          ],

          // ✅ List of Employees with Today’s Tip Amount
          todayEmployeeTips: [
            {
              $addFields: {
                paymentDate: { $toDate: "$paymentDate" },
              },
            },
            {
              $match: {
                paymentDate: {
                  $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                  $lt: new Date(new Date().setHours(23, 59, 59, 999)),
                },
              },
            },
            {
              $group: {
                _id: "$employeeId",
                todayTipAmount: { $sum: "$tipAmount" },
              },
            },
            {
              $lookup: {
                from: "employees",
                localField: "_id",
                foreignField: "_id",
                as: "employeeDetails",
              },
            },
            {
              $unwind: "$employeeDetails",
            },
            {
              $project: {
                employeeId: "$_id",
                employeeName: "$employeeDetails.name",
                todayTipAmount: 1,
              },
            },
            {
              $sort: { todayTipAmount: -1 },
            },
          ],

          // ✅ Total Employees Count
          totalEmployees: [
            {
              $lookup: {
                from: "employees",
                pipeline: [{ $count: "totalEmployees" }],
                as: "employees",
              },
            },
            {
              $unwind: {
                path: "$employees",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                totalEmployees: { $ifNull: ["$employees.totalEmployees", 0] },
              },
            },
            {
              $limit: 1,
            },
          ],
        },
      },
    ]);
    res.status(200).json(insights);
    return;
  } catch (e) {
    next(e);
  }
};

export const employeeWorkInsights = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { employeeId } = await req.params;
    const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start of the week (Sunday)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const insights = await Bill.aggregate([
    { $match: { employeeId: new mongoose.Types.ObjectId(employeeId) } },

    {
      $addFields: {
        paymentDateISO: { $toDate: "$paymentDate" },
      },
    },

    {
      $facet: {
        // 1. Current month weekly sales
        weeklySales: [
          { $match: { paymentDateISO: { $gte: startOfMonth } } },
          {
            $group: {
              _id: {
                week: {
                  $floor: {
                    $divide: [{ $subtract: ["$paymentDateISO", startOfMonth] }, 604800000],
                  },
                },
              },
              totalSales: { $sum: "$amount" },
            },
          },
          { $sort: { "_id.week": 1 } },
        ],

        // 2. Current year monthly sales
        monthlySales: [
          { $match: { paymentDateISO: { $gte: startOfYear } } },
          {
            $group: {
              _id: { month: { $month: "$paymentDateISO" } },
              totalSales: { $sum: "$amount" },
            },
          },
          { $sort: { "_id.month": 1 } },
        ],

        // 3. Total Tips
        totalTips: [
          {
            $group: {
              _id: null,
              totalTips: { $sum: "$tipAmount" },
            },
          },
        ],

        // 4. Total Incentive (20% of total sales)
        totalIncentive: [
          {
            $group: {
              _id: null,
              totalSales: { $sum: "$amount" },
            },
          },
          {
            $project: {
              incentive: { $multiply: ["$totalSales", 0.2] },
            },
          },
        ],

        // 5. Today's Sold Services
        todayServices: [
          { $match: { paymentDateISO: { $gte: today } } },
          { $unwind: "$serviceIds" },
          {
            $group: {
              _id: "$serviceIds",
              count: { $sum: 1 },
            },
          },
          {
            $lookup: {
              from: "services",
              localField: "_id",
              foreignField: "_id",
              as: "service",
            },
          },
          { $unwind: "$service" },
          {
            $project: {
              serviceName: "$service.name",
              serviceAmount: "$service.amount",
              soldCount: "$count",
            },
          },
        ],
      },
    },
  ]);

    res.status(200).json(insights);
  } catch (e) {
    next(e);
  }
};

export const customBillReports = async(req:Request,res:Response,next:NextFunction)=>{
  try{
    const { from, to } = req.params as { from: string; to: string };
    console.log("From date ",from);
    console.log("to Date",to)
  
    try {
      const bills = await Bill.find({
        paymentDate: {
          $gte: new Date(from).toISOString(), // Greater than or equal to fromDate
          $lte: new Date(to).toISOString(),   // Less than or equal to toDate
        },
      })
      .populate('employeeId',"name") // Populate Employee details
      .populate('serviceIds',"name")  // Populate Service details
      .exec();
  
      res.status(200).json(bills);
    } catch (error) {
      console.error('Error fetching bills:', error);
      throw error;
    }
  }catch(e){
    next(e);
  }
}
