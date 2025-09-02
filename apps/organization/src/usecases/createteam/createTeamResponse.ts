import { ServiceResponse } from '@libs/org/lib/express-framework/apiTransport';

interface CreateTeamResponse extends ServiceResponse {
  data: {
    id: string;
    name: string;
  },
}

export type { CreateTeamResponse };
