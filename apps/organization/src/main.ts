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

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

app.use(express.json());
app.use(apiToServiceRequestTransformerMiddleware);

const database = new Database();

// Usecases
const organizationRepository = new OrganizationRepository(database);
const createOrganizationUseCase = new CreateOrganizationUseCase(organizationRepository);
const createOrganizationController = new CreateOrganizationController(createOrganizationUseCase);

app.post('/organization',
  createOrganizationRequestValidatorMiddleware,
  createOrganizationController.handle);

app.use(serviceToApiResponseTransformerMiddleware);

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
