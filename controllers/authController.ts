import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Admin from '../models/admin';

// register
export const register = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { name, email, number, password } = req.body;

  try {
    const admin = await Admin.create({ name, email, number, password });
    res.json(admin);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Invalid email or password' });

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid email or password' });
    const authSecret = process.env.SECRET_TOKEN;
    if(!authSecret) throw new Error('Auth secret not found');

    const accessToken = jwt.sign({ id: admin._id }, process.env.SECRET_TOKEN as string, { expiresIn: '15d' });

    res.json({name: admin.name, accessToken,});
  } catch (error) {

    next(error);
  }
};

export const refreshToken = (req: Request, res: Response, next: NextFunction): void => {
  const refreshToken = req.body.token;
  if (!refreshToken) {
    res.sendStatus(401);
    return;
  } 

  jwt.verify(refreshToken, process.env.SECRET_TOKEN as string, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    const accessToken = jwt.sign({ id: user.id }, process.env.SECRET_TOKEN as string, { expiresIn: '15m' });
    res.json({ accessToken });
  });
};
