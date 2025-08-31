import { NextFunction, Request, Response } from 'express';
import { ExpressRequestWithApiRequest, ExpressResponseWithServiceResponse } from '../../apiTransport';
import { CreateTeamUseCase } from './createTeamUseCase';
import { CreateTeamRequest } from './createTeamRequest';

class CreateTeamController {
  private readonly createTeamUseCase: CreateTeamUseCase;

  constructor(createTeamUseCase: CreateTeamUseCase) {
    this.createTeamUseCase = createTeamUseCase;
  }

  handle = async (req: Request, res: Response, next: NextFunction) => {
    const createTeamRequest = (req as ExpressRequestWithApiRequest).apiRequest as CreateTeamRequest;
    (res as ExpressResponseWithServiceResponse).serviceResponse = await this.createTeamUseCase.createTeam(createTeamRequest);
    next();
  }
}

export { CreateTeamController };
