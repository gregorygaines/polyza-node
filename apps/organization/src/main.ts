import express from 'express';
import { Database } from './db';
import { createOrganizationRequestValidatorMiddleware } from './usecases/createOrganizationRequestValidatorMiddleware';
import { CreateOrganizationUseCase } from './usecases/createOrganizationUseCase';
import { CreateOrganizationController } from './usecases/createOrganizationController';
import { apiToServiceRequestTransformerMiddleware } from './middleware/apiToServiceRequestTransformerMiddleware';
import { OrganizationRepository } from './usecases/organizationRepository';
import { serviceToApiResponseTransformerMiddleware } from './middleware/serviceToApiResponseTransformerMiddleware';

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
