import { expect } from 'chai';
import { createSandbox, SinonSandbox, SinonStub } from 'sinon';
import { Customer, CustomerFilter, SearchCustomersRequest } from 'square-connect';
import { CustomerClientApi, IFindOrCreateCustomerRequest } from '../../../src';

describe('CustomerClientApi', (): void => {
    let customerClientApi: CustomerClientApi;
    let sandbox: SinonSandbox;

    const filter: CustomerFilter = {
        phone_number: {
            exact: '+14043833639',
        },
        email_address: {
            exact: 'test_user@mail.com',
        },
    };

    const searchCustomerReq: SearchCustomersRequest = {
        query: {
            filter,
            sort: {
                field: 'CREATED_AT',
                order: 'DESC',
            },
        },
    };

    const findOrCreateCustomerRequest: IFindOrCreateCustomerRequest = {
        phone_number: '+14043833639',
        email_address: 'test_user@mail.com',
    };

    const customer: Customer = {
        id: '60DERXYEFN77V6RSHM0ET6VWW0',
        created_at: '2021-02-11T09:50:46.283Z',
        updated_at: '2021-02-12T10:01:19Z',
        given_name: 'Test',
        family_name: 'User',
        phone_number: '+14043833639',
        note: '',
        reference_id: '000082297466356',
        preferences: {
            email_unsubscribed: false,
        },
        groups: [
            {
                id: 'gv2:TJ3XC1GTHS7355B12DXHWYNRQW',
                name: 'Email Subscribers',
            },
        ],
        creation_source: 'THIRD_PARTY',
        segment_ids: [],
    };

    const customerWithEmail: Customer = {
        ...customer,
        email_address: 'test_user@mail.com',
    };

    before(() => {
        sandbox = createSandbox();

        customerClientApi = new CustomerClientApi();
    });

    beforeEach(() => {
        sandbox.reset();
    });

    describe('findOrCreateCustomer', () => {
        let searchCustomersStub: SinonStub;
        let createCustomerStub: SinonStub;

        before(() => {
            searchCustomersStub = sandbox.stub(customerClientApi, 'searchCustomers');
            createCustomerStub = sandbox.stub(customerClientApi, 'createCustomer');
        });

        after(() => {
            searchCustomersStub.restore();
            createCustomerStub.restore();
        });

        it('should find customer', async () => {
            searchCustomersStub.withArgs(searchCustomerReq).resolves({ customers: [customerWithEmail] });

            await expect(customerClientApi.findOrCreateCustomer(findOrCreateCustomerRequest)).to.eventually.be.deep.eq(customerWithEmail);
        });

        it('should not found customer and create customer', async () => {
            searchCustomersStub.withArgs(searchCustomerReq).resolves({});

            createCustomerStub.withArgs(findOrCreateCustomerRequest).resolves({ customer: customerWithEmail });

            await expect(customerClientApi.findOrCreateCustomer(findOrCreateCustomerRequest)).to.eventually.be.deep.eq(customerWithEmail);
        });

        it('should create customer', async () => {
            const fakeFindOrCreateCustomerRequest: IFindOrCreateCustomerRequest = {
                phone_number: '+14043833639',
            };

            createCustomerStub.withArgs(fakeFindOrCreateCustomerRequest).resolves({ customer });

            await expect(customerClientApi.findOrCreateCustomer(fakeFindOrCreateCustomerRequest)).to.eventually.be.deep.eq(customer);
        });
    });
});
