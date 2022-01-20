import type { Customer, SearchCustomersRequest } from 'square';
import { CustomersApi } from 'square';
import type { IFindOrCreateCustomerRequest } from '../interface';

export class CustomerClientApi extends CustomersApi {
    async findOrCreateCustomer(body: IFindOrCreateCustomerRequest): Promise<Customer> {
        const { phoneNumber, emailAddress }: IFindOrCreateCustomerRequest = body;

        const searchCustomerReq: SearchCustomersRequest & { query: { filter: { phoneNumber: { exact: string } } } } = {
            query: {
                filter: {
                    phoneNumber: {
                        exact: phoneNumber,
                    },
                },
                sort: {
                    field: 'CREATED_AT',
                    order: 'DESC',
                },
            },
        };

        if (emailAddress) {
            searchCustomerReq.query.filter.emailAddress = { exact: emailAddress };

            const { result } = await this.searchCustomers(searchCustomerReq);

            const customer: Customer | undefined = result.customers?.shift();

            if (customer) {
                return customer;
            }
        }

        const { result } = await this.createCustomer(body);

        return result.customer!;
    }
}
