import { CreateOrganizationRequest } from './createOrganizationRequest';
import { OrganizationRepository } from './organizationRepository';
import { CreateOrganizationResponse } from './createOrganizationResponse';

class CreateOrganizationUseCase {
  private readonly organizationRepository: OrganizationRepository;

  constructor(organizationRepository: OrganizationRepository) {
    this.organizationRepository = organizationRepository;
  }

  createOrganization = async (req: CreateOrganizationRequest) => {
    if (this.organizationRepository.doesUserHaveADefaultOrganization(req.body.userId)) {
      console.log("User already has a default organization");
    } else {
      console.log("User does not have a default organization");
    }

    return Promise.resolve({} as CreateOrganizationResponse);
  }
}

export { CreateOrganizationUseCase };
