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
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Authentication middleware
const authenticateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers['authorization'];
        // Check if the authorization header exists and has the correct format
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Authorization header missing or invalid' });
            return;
        }
        // Extract the token
        const token = authHeader.split(' ')[1];
        // Ensure the secret exists
        const secret = process.env.SECRET_TOKEN;
        if (!secret) {
            throw new Error('SECRET_TOKEN environment variable not set');
        }
        // Verify the token
        const user = jsonwebtoken_1.default.verify(token, secret);
        req.user = user; // Attach user info to the request object
        next(); // Proceed to the next middleware or route handler
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            // Handle JWT-specific errors
            res.status(403).json({ message: 'Invalid token' });
            return;
        }
        // Handle other unexpected errors
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});
exports.authenticateToken = authenticateToken;
