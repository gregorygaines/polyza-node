import { CreateOrganizationUseCase } from './createOrganizationUseCase';
import { NextFunction, Request, Response } from 'express';

class CreateOrganizationController {
  private readonly createOrganizationUseCase: CreateOrganizationUseCase;

  constructor(createOrganizationUseCase: CreateOrganizationUseCase) {
    this.createOrganizationUseCase = createOrganizationUseCase;
  }

  handle = async (req: Request, res: Response, next: NextFunction) => {
    const createOrganizationRequest = (req as any).apiRequest;
    (res as any).serviceResponse = await this.createOrganizationUseCase.createOrganization(createOrganizationRequest);
    next();
  }
}

export { CreateOrganizationController };
