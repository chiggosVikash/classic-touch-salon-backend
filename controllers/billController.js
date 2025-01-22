"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBills = exports.createBill = void 0;
const bill_1 = __importDefault(require("../models/bill"));
const emailService_1 = require("../utils/emailService");
const employee_1 = __importDefault(require("../models/employee"));
const service_1 = __importDefault(require("../models/service"));
const createBill = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeId, services, tip, discount, paymentMethod } = req.body;
        const serviceObjects = yield service_1.default.find({ _id: { $in: services } });
        const subtotal = serviceObjects.reduce((sum, service) => sum + service.amount, 0);
        const amount = subtotal - discount + tip;
        const bill = new bill_1.default({
            employeeId,
            services,
            amount,
            tip,
            discount,
            paymentMethod,
            date: new Date(),
        });
        yield bill.save();
        const employee = yield employee_1.default.findById(bill.employeeId);
        if (!employee) {
            return next({ status: 404, message: 'Employee not found' });
        }
        yield (0, emailService_1.sendEmail)({
            to: employee.email,
            subject: 'New Bill Generated',
            text: `A new bill of $${bill.amount} has been generated for your services.`,
            html: `
        <h1>New Bill Generated</h1>
        <p>A new bill has been generated for your services:</p>
        <ul>
          <li>Subtotal: $${subtotal}</li>
          <li>Discount: $${discount}</li>
          <li>Tip: $${tip}</li>
          <li>Total Amount: $${amount}</li>
          <li>Payment Method: ${paymentMethod}</li>
          <li>Date: ${bill.date.toLocaleDateString()}</li>
          <li>Services: ${serviceObjects.map((s) => s.name).join(', ')}</li>
        </ul>
      `,
        });
        res.status(201).json(bill);
    }
    catch (error) {
        next({ status: 400, message: 'Error creating bill', error });
    }
});
exports.createBill = createBill;
const getBills = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bills = yield bill_1.default.find()
            .populate('employeeId', 'name')
            .populate('services', 'name amount');
        res.status(200).json(bills);
    }
    catch (error) {
        next({ status: 400, message: 'Error fetching bills', error });
    }
});
exports.getBills = getBills;
