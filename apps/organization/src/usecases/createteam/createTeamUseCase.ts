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

    await this.checkUserCreateTeamInOrganization(req, organization);

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

  private checkUserCreateTeamInOrganization = async (req: CreateTeamRequest, organization: Selectable<AppOrganization>) => {
    // Check if user has permission to create team in this organization.
    const userInOrganization = await this.organizationRepository.isUserInOrganization(req.headers['x-user-id'], organization.organizationId);
    if (!userInOrganization) {
      throw new Error('User is not a member of the organization');
    }

    // Get the user's role in the organization.
    const userOrganizationMemberRole = await this.organizationRepository.getUserOrganizationMemberRole(req.headers['x-user-id'], organization.organizationId);
    if (!userOrganizationMemberRole) {
      throw new Error('User does not have a role in the organization, this should never happen');
    }

    // Only the owner of the default organization can create teams.
    if (organization.defaultUserOrganization && userOrganizationMemberRole !== 'OWNER') {
      throw new Error('Only the owner of the default organization can create teams');
    }

    // Only admins and owners can create teams.
    if (userOrganizationMemberRole !== 'ADMIN' && userOrganizationMemberRole !== 'OWNER') {
      throw new Error('Only org admins and owners can create teams');
    }

    // TODO: Check is if the plan allows for team creation.
    // TODO: Check if the current user doesn't have an outstanding bill or suspended.
  };
}

export { CreateTeamUseCase };
