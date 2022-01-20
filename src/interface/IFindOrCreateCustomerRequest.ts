import type { CreateCustomerRequest } from 'square';

export interface IFindOrCreateCustomerRequest extends CreateCustomerRequest {
    phoneNumber: string;
}
