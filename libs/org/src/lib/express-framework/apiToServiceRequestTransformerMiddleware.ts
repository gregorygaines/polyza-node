import { NextFunction, Request, Response } from 'express';
import { ExpressRequestWithApiRequest } from './apiTransport';

export function apiToServiceRequestTransformerMiddleware(req: Request, res: Response, next: NextFunction) {
  (req as ExpressRequestWithApiRequest).apiRequest = {
    headers: req.headers,
    query: req.query,
    params: req.params,
    body: req.body
  };
  next();
}
