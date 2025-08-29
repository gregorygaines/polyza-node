import express from 'express';
import { Database } from './db';
import { createOrganizationRequestValidatorMiddleware } from './usecases/createOrganizationRequestValidatorMiddleware';
import { CreateOrganizationUseCase } from './usecases/createOrganizationUseCase';
import { CreateOrganizationController } from './usecases/createOrganizationController';
import { apiRequestTransformerMiddleware } from './apiRequestTransformerMiddleware';
import { OrganizationRepository } from './usecases/organizationRepository';
import { apiResponseTransformerMiddleware } from './apiResponseTransformerMiddleware';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

app.use(express.json());
app.use(apiRequestTransformerMiddleware);

const database = new Database();

// Usecases
const organizationRepository = new OrganizationRepository(database);
const createOrganizationUseCase = new CreateOrganizationUseCase(organizationRepository);
const createOrganizationController = new CreateOrganizationController(createOrganizationUseCase);

app.post('/organization',
  createOrganizationRequestValidatorMiddleware,
  createOrganizationController.handle);

app.use(apiResponseTransformerMiddleware);

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
