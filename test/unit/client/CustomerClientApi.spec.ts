import { expect } from 'chai';
import type { SinonSandbox, SinonStub } from 'sinon';
import { createSandbox } from 'sinon';
import type { Customer, CustomerFilter, SearchCustomersRequest } from 'square';
import type { IFindOrCreateCustomerRequest } from '../../../src';
import { CustomerClientApi, SquareClientFactory } from '../../../src';

describe('CustomerClientApi', (): void => {
    let customerClientApi: CustomerClientApi;
    let sandbox: SinonSandbox;

    const filter: CustomerFilter = {
        phoneNumber: {
            exact: '+14043833639',
        },
        emailAddress: {
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
        phoneNumber: '+14043833639',
        emailAddress: 'test_user@mail.com',
    };

    const customer: Customer = {
        id: '60DERXYEFN77V6RSHM0ET6VWW0',
        createdAt: '2021-02-11T09:50:46.283Z',
        updatedAt: '2021-02-12T10:01:19Z',
        givenName: 'Test',
        familyName: 'User',
        phoneNumber: '+14043833639',
        note: '',
        referenceId: '000082297466356',
        preferences: {
            emailUnsubscribed: false,
        },
        creationSource: 'THIRD_PARTY',
        segmentIds: [],
    };

    const customerWithEmail: Customer = {
        ...customer,
        emailAddress: 'test_user@mail.com',
    };

    before(() => {
        sandbox = createSandbox();

        customerClientApi = new CustomerClientApi(new SquareClientFactory().create('1111').getOriginClient());
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
            searchCustomersStub.withArgs(searchCustomerReq).resolves({ result: { customers: [customerWithEmail] } });

            await expect(customerClientApi.findOrCreateCustomer(findOrCreateCustomerRequest)).to.eventually.be.deep.eq(customerWithEmail);
        });

        it('should not found customer and create customer', async () => {
            searchCustomersStub.withArgs(searchCustomerReq).resolves({ result: {} });

            createCustomerStub.withArgs(findOrCreateCustomerRequest).resolves({ result: { customer: customerWithEmail } });

            await expect(customerClientApi.findOrCreateCustomer(findOrCreateCustomerRequest)).to.eventually.be.deep.eq(customerWithEmail);
        });

        it('should create customer', async () => {
            const fakeFindOrCreateCustomerRequest: IFindOrCreateCustomerRequest = {
                phoneNumber: '+14043833639',
            };

            createCustomerStub.withArgs(fakeFindOrCreateCustomerRequest).resolves({ result: { customer } });

            await expect(customerClientApi.findOrCreateCustomer(fakeFindOrCreateCustomerRequest)).to.eventually.be.deep.eq(customer);
        });
    });
});
