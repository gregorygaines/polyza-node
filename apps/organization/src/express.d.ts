import { ApiRequest, ApiResponse } from './apiTransport';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

declare global {
  export interface Request extends ExpressRequest {
    apiRequest?: ApiRequest
  }

  export interface Response extends ExpressResponse {
    serviceResponse?: ApiResponse
  }
}
