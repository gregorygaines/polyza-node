import { ApiRequest } from '../../apiTransport';


interface CreateOrganizationRequest extends ApiRequest {
  body: {
    name?: string;
  },
  headers: {
    'x-user-id': string;
  }
}

export type { CreateOrganizationRequest };
