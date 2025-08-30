import { NextFunction, Request, Response } from 'express';
import { ApiResponse, ServiceResponse } from '../apiTransport';

export function serviceToapiResponseTransformerMiddleware(req: Request, res: Response, next: NextFunction) {
  const serviceResponse: ServiceResponse = (res as any).serviceResponse;

  if (!serviceResponse) {
    throw new Error('Service response is missing in the interceptor middleware');
  }

  let status;
  if (serviceResponse.status) {
    status = serviceResponse.status;
  } else {
    status = 200;
  }

  const apiResponse: ApiResponse = {
    status: status,
    data: serviceResponse.data,
  }

  Object.entries(serviceResponse.headers || {}).forEach(([key, value]) => {
    if (value !== undefined) {
      res.setHeader(key, Array.isArray(value) ? value : String(value));
    }
  });

  res.status(status).json(apiResponse);
}
