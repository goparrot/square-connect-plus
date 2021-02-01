import { CreateCustomerRequest } from 'square-connect';

export interface IFindOrCreateCustomerRequest extends CreateCustomerRequest {
    phone_number: string;
}
