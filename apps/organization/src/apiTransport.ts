import { Request, Response } from 'express';

interface ApiRequest {
  body: object,
  query: object,
  params: object
  headers: Record<string, string | string[] | undefined>,
}

interface ServiceResponse {
  status?: number,
  data: object,
  headers?: Record<string, string | string[] | undefined>,
}

interface ApiResponse {
  status: number,
  data: object,
  error?: Error,
}

interface Error {
  code: string,
  message: string,
  details?: ErrorDetail[],
}

interface ErrorDetail {
  field: string,
  issue: string,
}

export interface ExpressRequestWithApiRequest extends Request {
  apiRequest: ApiRequest,
}

export interface ExpressResponseWithServiceResponse extends Response {
  serviceResponse: ServiceResponse,
}

export type { ApiRequest, ServiceResponse, ApiResponse };
