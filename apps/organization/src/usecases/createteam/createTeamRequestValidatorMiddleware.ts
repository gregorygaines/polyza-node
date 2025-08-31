import { NextFunction, Request, Response } from 'express';
import { CreateTeamRequest } from './createTeamRequest';
import { ExpressRequestWithApiRequest } from '../../apiTransport';

export function createTeamRequestValidatorMiddleware(req: Request, res: Response, next: NextFunction) {
  const createTeamRequest: CreateTeamRequest = (req as ExpressRequestWithApiRequest).apiRequest as CreateTeamRequest;

  if (!createTeamRequest.headers['x-user-id']) {
    throw new Error("The CreateOrganizationRequest requires a userId");
  }

  next();
}
