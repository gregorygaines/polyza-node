import { TeamRepository } from './teamRepository';
import { OrganizationRepository } from '../createorganization';
import { CreateTeamResponse } from './createTeamResponse';
import { CreateTeamRequest } from './createTeamRequest';
import { AppOrganization } from '../../generated/db/db';
import { Selectable } from 'kysely';

class CreateTeamUseCase {
  private static readonly MAX_TEAM_NAME_LENGTH = 32;

  private readonly teamRepository: TeamRepository;
  private readonly organizationRepository: OrganizationRepository;

  constructor(teamRepository: TeamRepository, organizationRepository: OrganizationRepository) {
    this.teamRepository = teamRepository;
    this.organizationRepository = organizationRepository;

    console.log('CreateTeamUseCase initialized', this.teamRepository);
  }

  // TODO: We need to check if organization has permission to create team.
  // TODO: Cap the number of teams an organization can create based on their plan.
  createTeam = async (req: CreateTeamRequest): Promise<CreateTeamResponse> => {
    CreateTeamUseCase.checkTeamNameLimits(req);

    const organization = await this.organizationRepository.getOrganizationById(req.body.organizationId);
    if (!organization) {
      throw new Error('Organization does not exist');
    }

    const canUserCreateTeam = await this.canUserCreateTeamInOrganization(req, organization);
    if (!canUserCreateTeam) {
      throw new Error('User does not have permission to create a team in this organization');
    }

    const teamNameTaken = await this.teamRepository.isTeamNameTakenInOrganization(req.body.organizationId, req.body.name);
    if (teamNameTaken) {
      throw new Error('A team with this name already exists in the organization');
    }

    const createdTeam = await this.teamRepository.createTeam(req.body.name, req.headers['x-user-id'], req.body.organizationId);
    if (!createdTeam) {
      throw new Error('Failed to create team');
    }
    return {
      data: {
        id: createdTeam.teamId,
        name: createdTeam.name
      }
    };
  };

  private static checkTeamNameLimits = (req: CreateTeamRequest) => {
    const teamName = req.body.name.trim();
    if (teamName.length === 0) {
      throw new Error('Team name cannot be empty');
    }
    if (teamName.length > CreateTeamUseCase.MAX_TEAM_NAME_LENGTH) {
      throw new Error(`Team name cannot be longer than ${CreateTeamUseCase.MAX_TEAM_NAME_LENGTH} characters`);
    }
  };

  private canUserCreateTeamInOrganization = async (req: CreateTeamRequest, organization: Selectable<AppOrganization>): Promise<boolean> => {
    // Check if user has permission to create team in this organization.
    const userInOrganization = await this.organizationRepository.isUserInOrganization(req.headers['x-user-id'], organization.organizationId);
    if (!userInOrganization) {
      return false;
    }

    // Get the user's role in the organization.
    const userOrganizationMemberRole = await this.organizationRepository.getUserOrganizationMemberRole(req.headers['x-user-id'], organization.organizationId);
    if (!userOrganizationMemberRole) {
      return false;
    }

    // Only the owner of the default organization can create teams.
    if (organization.defaultUserOrganization && userOrganizationMemberRole !== 'OWNER') {
      return false;
    }

    // Only admins and owners can create teams.
    if (userOrganizationMemberRole !== 'ADMIN' && userOrganizationMemberRole !== 'OWNER') {
      return false;
    }


    // TODO: Check is if the plan allows for team creation.
    // TODO: Check if the current user doesn't have an outstanding bill or suspended.
    return true;
  };
}

export { CreateTeamUseCase };
