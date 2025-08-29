import { NextFunction, Request, Response } from 'express';
import { CreateOrganizationRequest } from './createOrganizationRequest';

export function createOrganizationRequestValidatorMiddleware(req: Request, res: Response, next: NextFunction) {
  const createOrganizationRequest: CreateOrganizationRequest = (req as any).apiRequest;

  if (!createOrganizationRequest.body.userId) {
    throw new Error("The CreateOrganizationRequest requires a userId");
  }

  next();
}
