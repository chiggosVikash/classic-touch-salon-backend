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
exports.deleteService = exports.updateService = exports.getService = exports.getServices = exports.createService = void 0;
const service_1 = __importDefault(require("../models/service"));
const createService = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const service = new service_1.default(req.body);
        yield service.save();
        res.status(201).json(service);
    }
    catch (error) {
        next({ status: 400, message: 'Error creating service', error });
    }
});
exports.createService = createService;
const getServices = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const services = yield service_1.default.find();
        res.status(200).json(services);
    }
    catch (error) {
        next({ status: 400, message: 'Error fetching services', error });
    }
});
exports.getServices = getServices;
const getService = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const service = yield service_1.default.findById(req.params.id);
        if (!service) {
            return next({ status: 404, message: 'Service not found' });
        }
        res.status(200).json(service);
    }
    catch (error) {
        next({ status: 400, message: 'Error fetching service', error });
    }
});
exports.getService = getService;
const updateService = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const service = yield service_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!service) {
            return next({ status: 404, message: 'Service not found' });
        }
        res.status(200).json(service);
    }
    catch (error) {
        next({ status: 400, message: 'Error updating service', error });
    }
});
exports.updateService = updateService;
const deleteService = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const service = yield service_1.default.findByIdAndDelete(req.params.id);
        if (!service) {
            return next({ status: 404, message: 'Service not found' });
        }
        res.status(200).json({ message: 'Service deleted successfully' });
    }
    catch (error) {
        next({ status: 400, message: 'Error deleting service', error });
    }
});
exports.deleteService = deleteService;
