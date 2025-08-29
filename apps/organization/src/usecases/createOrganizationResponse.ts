import { ServiceResponse } from '../apiTransport';

interface CreateOrganizationResponse extends ServiceResponse {
  data: {
    id: string;
  };
}

export type { CreateOrganizationResponse };
