import { ApiRequest } from '../../apiTransport';


interface CreateOrganizationRequest extends ApiRequest {
  body: {
    name?: string;
    description?: string;
  },
  headers: {
    'x-user-id': string;
  }
}

export type { CreateOrganizationRequest };
