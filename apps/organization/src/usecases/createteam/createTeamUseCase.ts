import { TeamRepository } from './teamRepository';
import { OrganizationRepository } from '../createorganization';
import { CreateTeamResponse } from './createTeamResponse';
import { CreateTeamRequest } from './createTeamRequest';
import { AppOrganization } from '../../generated/db/db';
import { Selectable } from 'kysely';

class CreateTeamUseCase {
  private readonly teamRepository: TeamRepository;
  private readonly organizationRepository: OrganizationRepository;

  constructor(teamRepository: TeamRepository, organizationRepository: OrganizationRepository) {
    this.teamRepository = teamRepository;
    this.organizationRepository = organizationRepository;

    console.log("CreateTeamUseCase initialized", this.teamRepository);
  }

  // TODO: We need to check if organization has permission to create team.
  // TODO: Cap the number of teams an organization can create based on their plan.
  createTeam = async (req: CreateTeamRequest): Promise<CreateTeamResponse> => {
    const organization = await this.organizationRepository.getOrganizationById(req.body.organizationId);
    if (!organization) {
      throw new Error("Organization does not exist");
    }

    if (!this.canUserCreateTeamInOrganization(req, organization)) {
      throw new Error("User does not have permission to create a team in this organization");
    }


    return Promise.resolve({} as CreateTeamResponse);
  };

  private canUserCreateTeamInOrganization = (req: CreateTeamRequest, organization: Selectable<AppOrganization>): boolean => {
    // TODO: Check if user has permission to create team in this organization.
    // TODO: One condition is if the organization is a default organization, only the owner can create teams.
    // TODO: Another is if the plan allows for team creation.
    // TODO: Another is the current user doesn't have an outstanding bill or suspended.
    // TODO: Another is the user is a member of the organization.
    return false;
  }
}

export { CreateTeamUseCase };
