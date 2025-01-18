import { Request, Response, NextFunction } from 'express';
import Service, { IService } from '../models/service';

export const createService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const service = new Service(req.body as IService);
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    next({ status: 400, message: 'Error creating service', error });
  }
};

export const getServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    next({ status: 400, message: 'Error fetching services', error });
  }
};

export const getService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return next({ status: 404, message: 'Service not found' });
    }
    res.status(200).json(service);
  } catch (error) {
    next({ status: 400, message: 'Error fetching service', error });
  }
};

export const updateService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) {
      return next({ status: 404, message: 'Service not found' });
    }
    res.status(200).json(service);
  } catch (error) {
    next({ status: 400, message: 'Error updating service', error });
  }
};

export const deleteService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return next({ status: 404, message: 'Service not found' });
    }
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    next({ status: 400, message: 'Error deleting service', error });
  }
};
