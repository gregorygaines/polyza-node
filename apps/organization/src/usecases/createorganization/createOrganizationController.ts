import { CreateOrganizationUseCase } from './createOrganizationUseCase';
import { NextFunction, Request, Response } from 'express';
import { ExpressRequestWithApiRequest, ExpressResponseWithServiceResponse } from '../../apiTransport';
import { CreateOrganizationRequest } from './createOrganizationRequest';

class CreateOrganizationController {
  private readonly createOrganizationUseCase: CreateOrganizationUseCase;

  constructor(createOrganizationUseCase: CreateOrganizationUseCase) {
    this.createOrganizationUseCase = createOrganizationUseCase;
  }

  handle = async (req: Request, res: Response, next: NextFunction) => {
    const createOrganizationRequest = (req as ExpressRequestWithApiRequest).apiRequest as CreateOrganizationRequest;
    (res as ExpressResponseWithServiceResponse).serviceResponse = await this.createOrganizationUseCase.createOrganization(createOrganizationRequest);
    next();
  }
}

export { CreateOrganizationController };
