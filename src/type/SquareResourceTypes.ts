import type { SquareClient } from 'square';
import type { FunctionKeys, NonFunctionKeys, ReadonlyKeys } from 'utility-types';

export type SquareClientResourceName = Extract<ReadonlyKeys<SquareClient>, NonFunctionKeys<SquareClient>>;
export type SquareClientResource<T extends SquareClientResourceName> = SquareClient[T];

export type ApplePayClient = SquareClientResource<'applePay'>;
export type ApplePayMethod = FunctionKeys<ApplePayClient>;

export type CardsClient = SquareClientResource<'cards'>;
export type CardsMethod = FunctionKeys<CardsClient>;

export type CatalogClient = SquareClientResource<'catalog'>;
export type CatalogMethod = FunctionKeys<CatalogClient>;

export type CheckoutClient = SquareClientResource<'checkout'>;
export type CheckoutMethod = FunctionKeys<CheckoutClient>;

export type CustomersClient = SquareClientResource<'customers'>;
export type CustomersMethod = FunctionKeys<CustomersClient>;

export type EmployeesClient = SquareClientResource<'employees'>;
export type EmployeesMethod = FunctionKeys<EmployeesClient>;

export type GiftCardsClient = SquareClientResource<'giftCards'>;
export type GiftCardsMethod = FunctionKeys<GiftCardsClient>;

export type InventoryClient = SquareClientResource<'inventory'>;
export type InventoryMethod = FunctionKeys<InventoryClient>;

export type InvoicesClient = SquareClientResource<'invoices'>;
export type InvoicesMethod = FunctionKeys<InvoicesClient>;

export type LaborClient = SquareClientResource<'labor'>;
export type LaborMethod = FunctionKeys<LaborClient>;

export type LocationsClient = SquareClientResource<'locations'>;
export type LocationsMethod = FunctionKeys<LocationsClient>;

export type LoyaltyClient = SquareClientResource<'loyalty'>;
export type LoyaltyMethod = FunctionKeys<LoyaltyClient>;

export type MerchantsClient = SquareClientResource<'merchants'>;
export type MerchantsMethod = FunctionKeys<MerchantsClient>;

export type MobileClient = SquareClientResource<'mobile'>;
export type MobileMethod = FunctionKeys<MobileClient>;

export type OAuthClient = SquareClientResource<'oAuth'>;
export type OAuthMethod = FunctionKeys<OAuthClient>;

export type OrdersClient = SquareClientResource<'orders'>;
export type OrdersMethod = FunctionKeys<OrdersClient>;

export type PaymentsClient = SquareClientResource<'payments'>;
export type PaymentsMethod = FunctionKeys<PaymentsClient>;

export type RefundsClient = SquareClientResource<'refunds'>;
export type RefundsMethod = FunctionKeys<RefundsClient>;

export type TeamClient = SquareClientResource<'team'>;
export type TeamMethod = FunctionKeys<TeamClient>;

export type V1TransactionsClient = SquareClientResource<'v1Transactions'>;
export type V1TransactionsMethod = FunctionKeys<V1TransactionsClient>;
