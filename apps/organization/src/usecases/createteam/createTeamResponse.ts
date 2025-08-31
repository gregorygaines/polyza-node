import { ServiceResponse } from '../../apiTransport';

interface CreateTeamResponse extends ServiceResponse {
  data: {
    id: string;
    name: string;
  },
}

export type { CreateTeamResponse };
