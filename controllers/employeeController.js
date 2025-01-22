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
exports.deleteEmployee = exports.updateEmployee = exports.getEmployee = exports.getEmployees = exports.createEmployee = void 0;
const employee_1 = __importDefault(require("../models/employee"));
const createEmployee = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employee = new employee_1.default(req.body);
        yield employee.save();
        res.status(201).json(employee);
    }
    catch (error) {
        next({ status: 400, message: 'Error creating employee', error });
    }
});
exports.createEmployee = createEmployee;
const getEmployees = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employees = yield employee_1.default.find();
        res.status(200).json(employees);
    }
    catch (error) {
        next({ status: 400, message: 'Error fetching employees', error });
    }
});
exports.getEmployees = getEmployees;
const getEmployee = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employee = yield employee_1.default.findById(req.params.id);
        if (!employee) {
            return next({ status: 404, message: 'Employee not found' });
        }
        res.status(200).json(employee);
    }
    catch (error) {
        next({ status: 400, message: 'Error fetching employee', error });
    }
});
exports.getEmployee = getEmployee;
const updateEmployee = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employee = yield employee_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!employee) {
            return next({ status: 404, message: 'Employee not found' });
        }
        res.status(200).json(employee);
    }
    catch (error) {
        next({ status: 400, message: 'Error updating employee', error });
    }
});
exports.updateEmployee = updateEmployee;
const deleteEmployee = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employee = yield employee_1.default.findByIdAndDelete(req.params.id);
        if (!employee) {
            return next({ status: 404, message: 'Employee not found' });
        }
        res.status(200).json({ message: 'Employee deleted successfully' });
    }
    catch (error) {
        next({ status: 400, message: 'Error deleting employee', error });
    }
});
exports.deleteEmployee = deleteEmployee;
