import { CreateOrganizationRequest } from './createOrganizationRequest';
import { OrganizationRepository } from './organizationRepository';
import { CreateOrganizationResponse } from './createOrganizationResponse';
import slugify from 'slugify';
import { generateShortId } from './shortIdGenerator';


class CreateOrganizationUseCase {
  private static readonly MAX_ATTEMPTS_TO_APPEND_UNIQUE_ID_TO_ORGANIZATION_SLUG = 10;
  private static readonly MAX_ORGANIZATION_NAME_LENGTH = 10;

  private readonly organizationRepository: OrganizationRepository;

  constructor(organizationRepository: OrganizationRepository) {
    this.organizationRepository = organizationRepository;
  }

  createOrganization = async (req: CreateOrganizationRequest): Promise<CreateOrganizationResponse> => {
    let org;
    if (await this.organizationRepository.doesUserHaveADefaultOrganization(req.body.userId)) {
      org = await this.createAdditionalOrganization(req);
    } else {
      console.log('User does not have a default organization');
    }

    if (!org) {
      throw Error('Failed to create organization');
    }

    return {
      data: {
        id: org.organization_id as string,
      }
    }
  };

  private createAdditionalOrganization = async (req: CreateOrganizationRequest) => {
    if (!req.body.name) {
      throw Error('Organization name must be provided for creating a non-default organizations');
    }

    const orgName = this.createOrganizationName(req.body.name);
    const uniqueOrgSlug = await this.createUniqueOrganizationSlug(orgName);

    return this.organizationRepository.createOrganization(req.body.userId, orgName, uniqueOrgSlug, req.body.description, false);
  };

  private createOrganizationName = (orgName: string): string => {
    if (orgName.length > CreateOrganizationUseCase.MAX_ORGANIZATION_NAME_LENGTH) {
      const excessLength = orgName.length -  CreateOrganizationUseCase.MAX_ORGANIZATION_NAME_LENGTH;
      return orgName.substring(0, orgName.length - excessLength);
    }
    return orgName;
  };

  // private createDefaultOrganizationName = (userName: string): string => {
  //   let orgName = `${userName}'s Organization`;
  //   if (orgName.length >  CreateOrganizationUseCase.MAX_ORGANIZATION_NAME_LENGTH) {
  //     const excessLength = orgName.length -  CreateOrganizationUseCase.MAX_ORGANIZATION_NAME_LENGTH;
  //     orgName = `${userName.substring(0, userName.length - excessLength)}'s Organization`;
  //   }
  //   return orgName;
  // };

  private createUniqueOrganizationSlug = async (organizationName: string): Promise<string> => {
    const defaultSlug = this.createOrganizationSlug(organizationName);
    if (!await this.organizationRepository.doesOrganizationSlugExist(defaultSlug)) {
      return defaultSlug;
    }
    return await this.appendUniqueIdToOrganizationSlug(defaultSlug);
  };

  private appendUniqueIdToOrganizationSlug = async (defaultOrganizationSlug: string): Promise<string> => {
    for (let attempt = 0; attempt < CreateOrganizationUseCase.MAX_ATTEMPTS_TO_APPEND_UNIQUE_ID_TO_ORGANIZATION_SLUG; attempt++) {
      const shortId = generateShortId();
      const updatedOrganizationSlug = slugify(`${defaultOrganizationSlug}-${shortId}`, { lower: true, strict: true });
      const exists = await this.organizationRepository.doesOrganizationSlugExist(updatedOrganizationSlug);
      if (!exists) {
        return updatedOrganizationSlug;
      }
      console.warn(`Generated organization slug already exists, retrying attempt: ${attempt + 1}...`);
    }
    throw new Error(
      `Failed to generate a unique organization slug after ${CreateOrganizationUseCase.MAX_ATTEMPTS_TO_APPEND_UNIQUE_ID_TO_ORGANIZATION_SLUG} attempts`
    );
  };

  createOrganizationSlug = (orgName: string): string => {
    return slugify(orgName, { lower: true, strict: true });
  };
}

export { CreateOrganizationUseCase };
