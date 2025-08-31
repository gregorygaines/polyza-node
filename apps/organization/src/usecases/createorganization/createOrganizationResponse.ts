import { ServiceResponse } from '../../apiTransport';


interface CreateOrganizationResponse extends ServiceResponse {
  data: {
    id: string;
    name: string;
    slug: string;
  };
}

export type { CreateOrganizationResponse };
