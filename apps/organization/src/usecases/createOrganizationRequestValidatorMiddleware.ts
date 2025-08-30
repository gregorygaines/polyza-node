import { NextFunction, Request, Response } from 'express';
import { CreateOrganizationRequest } from './createOrganizationRequest';
import { ExpressRequestWithApiRequest } from '../apiTransport';

export function createOrganizationRequestValidatorMiddleware(req: Request, res: Response, next: NextFunction) {
  const createOrganizationRequest: CreateOrganizationRequest = (req as ExpressRequestWithApiRequest).apiRequest as CreateOrganizationRequest;

  if (!createOrganizationRequest.body.userId) {
    throw new Error("The CreateOrganizationRequest requires a userId");
  }

  next();
}
