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
exports.refreshToken = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const admin_1 = __importDefault(require("../models/admin"));
// register
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, number, password } = req.body;
    try {
        const admin = yield admin_1.default.create({ name, email, number, password });
        res.json(admin);
    }
    catch (error) {
        next(error);
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const admin = yield admin_1.default.findOne({ email });
        if (!admin)
            return res.status(400).json({ message: 'Invalid email or password' });
        const validPassword = yield bcrypt_1.default.compare(password, admin.password);
        if (!validPassword)
            return res.status(400).json({ message: 'Invalid email or password' });
        const accessToken = jsonwebtoken_1.default.sign({ id: admin._id }, process.env.SECRET_TOKEN, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ id: admin._id }, process.env.SECRET_TOKEN);
        res.json({ email, name: admin.name, number: admin.number, accessToken, refreshToken });
    }
    catch (error) {
        next(error);
    }
});
exports.login = login;
const refreshToken = (req, res, next) => {
    const refreshToken = req.body.token;
    if (!refreshToken) {
        res.sendStatus(401);
        return;
    }
    jsonwebtoken_1.default.verify(refreshToken, process.env.SECRET_TOKEN, (err, user) => {
        if (err)
            return res.sendStatus(403);
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.SECRET_TOKEN, { expiresIn: '15m' });
        res.json({ accessToken });
    });
};
exports.refreshToken = refreshToken;
