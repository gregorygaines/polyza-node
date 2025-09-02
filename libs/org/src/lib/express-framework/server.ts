import express from 'express';
import { apiToServiceRequestTransformerMiddleware } from './apiToServiceRequestTransformerMiddleware';
require('express-async-errors');

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

class Server {
  private readonly app: express.Application;

  constructor() {
    this.app = express();
    this.app.use(express.json());
  }

  getApp = () => {
    return this.app;
  }

  start = () => {
    this.app.use(apiToServiceRequestTransformerMiddleware);

    this.app.listen(port, host, () => {
      console.log(`[ ready ] http://${host}:${port}`);
    });
  }
}

export { Server };
