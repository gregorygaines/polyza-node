import { TeamRepository } from './teamRepository';
import { CreateOrganizationRequest } from '../createorganization';
import { CreateTeamResponse } from './createTeamResponse';

class CreateTeamUseCase {
  private readonly teamRepository: TeamRepository;

  constructor(teamRepository: TeamRepository) {
    this.teamRepository = teamRepository;

    console.log(this.teamRepository);
  }

  createTeam = async (req: CreateOrganizationRequest): Promise<CreateTeamResponse> => {
    return Promise.resolve({} as CreateTeamResponse);
  };
}

export { CreateTeamUseCase };
