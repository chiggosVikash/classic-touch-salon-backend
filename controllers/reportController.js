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
exports.generateEmployeeReport = exports.generateSalesReport = void 0;
const bill_1 = __importDefault(require("../models/bill"));
const employee_1 = __importDefault(require("../models/employee"));
const generateSalesReport = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        const bills = yield bill_1.default.find({
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            },
        }).populate('employeeId', 'name');
        const totalSales = bills.reduce((sum, bill) => sum + bill.amount, 0);
        const salesByEmployee = bills.reduce((acc, bill) => {
            const employeeName = bill.employeeId.name;
            acc[employeeName] = (acc[employeeName] || 0) + bill.amount;
            return acc;
        }, {});
        res.status(200).json({ totalSales, salesByEmployee, bills });
    }
    catch (error) {
        next({ status: 400, message: 'Error generating sales report', error });
    }
});
exports.generateSalesReport = generateSalesReport;
const generateEmployeeReport = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employees = yield employee_1.default.find();
        const employeeReports = yield Promise.all(employees.map((employee) => __awaiter(void 0, void 0, void 0, function* () {
            const bills = yield bill_1.default.find({ employeeId: employee._id });
            const totalSales = bills.reduce((sum, bill) => sum + bill.amount, 0);
            const billCount = bills.length;
            return {
                employee: employee.name,
                totalSales,
                billCount,
                averageSalePerBill: billCount ? totalSales / billCount : 0,
            };
        })));
        res.status(200).json(employeeReports);
    }
    catch (error) {
        next({ status: 400, message: 'Error generating employee report', error });
    }
});
exports.generateEmployeeReport = generateEmployeeReport;
