import { CreateOrganizationRequest } from './createOrganizationRequest';
import { OrganizationRepository } from './organizationRepository';
import { CreateOrganizationResponse } from './createOrganizationResponse';
import slugify from 'slugify';
import { generateShortId } from './shortIdGenerator';
import { AppOrganization } from '../../generated/db/db';
import { Selectable } from 'kysely';

class CreateOrganizationUseCase {
  private static readonly MAX_ATTEMPTS_TO_APPEND_UNIQUE_ID_TO_ORGANIZATION_SLUG = 10;
  private static readonly MAX_ORGANIZATION_NAME_LENGTH = 32;

  private readonly organizationRepository: OrganizationRepository;

  constructor(organizationRepository: OrganizationRepository) {
    this.organizationRepository = organizationRepository;
  }

  createOrganization = async (req: CreateOrganizationRequest): Promise<CreateOrganizationResponse> => {
    // TODO: Enforce max number of organizations a user can own

    let organization: Partial<Selectable<AppOrganization>>;
    if (await this.organizationRepository.doesUserHaveADefaultOrganization(req.headers['x-user-id'])) {
      organization = await this.createAdditionalOrganization(req);
    } else {
      organization = await this.createDefaultOrganization(req);
    }

    if (!organization) {
      throw Error('Failed to create organization');
    }
    if (!organization.name) {
      throw Error('Created organization is missing a name');
    }
    if (!organization.slug) {
      throw Error('Created organization is missing a slug');
    }

    return {
      data: {
        id: organization.organization_id as string,
        name: organization.name,
        slug: organization.slug,
      }
    };
  };

  // private getMaxOwnableOrganizations = () => {
  //   return 5;
  // }

  private createAdditionalOrganization = async (req: CreateOrganizationRequest) => {
    if (!req.body.name) {
      throw Error('Organization name must be provided for creating a non-default organizations');
    }

    const organizationName = this.createOrganizationName(req.body.name);
    const organizationSlug = await this.createUniqueOrganizationSlug(organizationName);

    return this.organizationRepository.createOrganization(req.headers['x-user-id'], organizationName, organizationSlug, /* defaultUserOrganization= */ false);
  };

  private createDefaultOrganization = async (req: CreateOrganizationRequest) => {
    // TODO: Fetch user name from user service
    const userName = "DeezNutsInYourMouth";
    const organizationName = this.createDefaultOrganizationName(userName);
    const organizationSlug = await this.createUniqueOrganizationSlug(organizationName);

    return this.organizationRepository.createOrganization(req.headers['x-user-id'], organizationName, organizationSlug, /* defaultUserOrganization= */ true);
  }

  private createOrganizationName = (orgName: string): string => {
    if (orgName.length > CreateOrganizationUseCase.MAX_ORGANIZATION_NAME_LENGTH) {
      const excessLength = orgName.length - CreateOrganizationUseCase.MAX_ORGANIZATION_NAME_LENGTH;
      return orgName.substring(0, orgName.length - excessLength);
    }
    return orgName;
  };

  private createDefaultOrganizationName = (userName: string): string => {
    let orgName = `${userName}'s Organization`;
    if (orgName.length >  CreateOrganizationUseCase.MAX_ORGANIZATION_NAME_LENGTH) {
      const excessLength = orgName.length -  CreateOrganizationUseCase.MAX_ORGANIZATION_NAME_LENGTH;
      orgName = `${userName.substring(0, userName.length - excessLength)}'s Organization`;
    }
    return orgName;
  };

  private createUniqueOrganizationSlug = async (organizationName: string): Promise<string> => {
    const defaultSlug = this.slugify(organizationName);
    if (!await this.organizationRepository.doesOrganizationSlugExist(defaultSlug)) {
      return defaultSlug;
    }
    return await this.appendUniqueIdToOrganizationSlug(defaultSlug);
  };

  private appendUniqueIdToOrganizationSlug = async (organizationSlug: string): Promise<string> => {
    for (let attempt = 0; attempt < CreateOrganizationUseCase.MAX_ATTEMPTS_TO_APPEND_UNIQUE_ID_TO_ORGANIZATION_SLUG; attempt++) {
      const shortId = generateShortId();
      const updatedOrganizationSlug = this.slugify(`${organizationSlug}-${shortId}`);
      const exists = await this.organizationRepository.doesOrganizationSlugExist(updatedOrganizationSlug);
      if (!exists) {
        return updatedOrganizationSlug;
      }
      console.warn(`Generated organization slug already exists, retrying attempt: ${attempt + 1}...`);
    }
    throw new Error(
      `Failed to generate a unique organization for ${organizationSlug} slug after ${CreateOrganizationUseCase.MAX_ATTEMPTS_TO_APPEND_UNIQUE_ID_TO_ORGANIZATION_SLUG} attempts`
    );
  };

  private slugify = (orgName: string): string => {
    return slugify(orgName, { lower: true, strict: true });
  };
}

export { CreateOrganizationUseCase };
