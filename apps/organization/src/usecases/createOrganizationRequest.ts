import { ApiRequest } from '../apiTransport';

interface CreateOrganizationRequest extends ApiRequest {
  body: {
    userId: string;
    name: string;
    description?: string;
  },
}

export type { CreateOrganizationRequest };
