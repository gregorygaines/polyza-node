import { NextFunction, Request, Response } from 'express';
import { ApiRequest } from './apiTransport';

export function apiRequestTransformerMiddleware(req: Request, res: Response, next: NextFunction) {
  (req as any).apiRequest = {
    headers: req.headers,
    query: req.query,
    params: req.params,
    body: req.body
  } as ApiRequest;
  next();
}
