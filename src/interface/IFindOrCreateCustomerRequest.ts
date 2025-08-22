import type { CreateCustomerRequest } from 'square/legacy';

export interface IFindOrCreateCustomerRequest extends CreateCustomerRequest {
    phoneNumber: string;
}
