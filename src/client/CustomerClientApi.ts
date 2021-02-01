import { Customer, CustomersApi, SearchCustomersRequest, SearchCustomersResponse } from 'square-connect';
import { IFindOrCreateCustomerRequest } from '../interface';

export class CustomerClientApi extends CustomersApi {
    async findOrCreateCustomer(findOrCreateCustomerRequest: IFindOrCreateCustomerRequest): Promise<Customer> {
        const { phone_number, email_address }: IFindOrCreateCustomerRequest = findOrCreateCustomerRequest;

        const searchCustomerReq: SearchCustomersRequest = {
            query: {
                filter: {
                    phone_number: {
                        exact: phone_number,
                    },
                },
                sort: {
                    field: 'CREATED_AT',
                    order: 'DESC',
                },
            },
        };

        if (email_address) {
            searchCustomerReq.query!.filter!.email_address = {
                exact: email_address,
            };

            const { customers }: SearchCustomersResponse = await this.searchCustomers(searchCustomerReq);

            const customer: Customer | undefined = customers?.shift();

            if (customer) {
                return customer;
            }
        }

        const { customer } = await this.createCustomer(findOrCreateCustomerRequest);

        return customer!;
    }
}
