import { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../server';

// This file acts as an adapter between Vercel serverless functions and Express
// It forwards all requests to your Express application
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // This is a simple proxy that forwards the request to Express
  app(req, res);
}
