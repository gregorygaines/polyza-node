import express from 'express';
import { Database } from './db';
import {
  apiToServiceRequestTransformerMiddleware,
  serviceToApiResponseTransformerMiddleware
} from './middleware';
import {
  CreateOrganizationController,
  createOrganizationRequestValidatorMiddleware,
  CreateOrganizationUseCase,
  OrganizationRepository
} from './usecases/createorganization';
import { CreateTeamUseCase, TeamRepository } from './usecases/createteam';
import { CreateTeamController } from './usecases/createteam/createTeamController';
import { createTeamRequestValidatorMiddleware } from './usecases/createteam/createTeamRequestValidatorMiddleware';
require('express-async-errors');

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

app.use(express.json());
app.use(apiToServiceRequestTransformerMiddleware);

const database = new Database();

// Use Cases
const organizationRepository = new OrganizationRepository(database);
const createOrganizationUseCase = new CreateOrganizationUseCase(organizationRepository);
const createOrganizationController = new CreateOrganizationController(createOrganizationUseCase);

const teamRepository = new TeamRepository(database);
const createTeamUseCase = new CreateTeamUseCase(teamRepository, organizationRepository);
const createTeamController = new CreateTeamController(createTeamUseCase);


// Routes
app.post('/organization',
  createOrganizationRequestValidatorMiddleware,
  createOrganizationController.handle);

app.post('/team',
  createTeamRequestValidatorMiddleware,
  createTeamController.handle);

app.use(serviceToApiResponseTransformerMiddleware);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json(JSON.stringify(err, Object.getOwnPropertyNames(err)));
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
