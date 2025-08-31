import { ApiRequest } from '../../apiTransport';

interface CreateTeamRequest extends ApiRequest {
  body: {
    organizationId: string,
    name: string,
  },
  headers: {
    'x-user-id': string,
  }
}

export type { CreateTeamRequest };
