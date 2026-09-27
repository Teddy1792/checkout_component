export interface Address {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  priceInCents: number;
  label: string;
}

export interface CheckoutData {
  member: {
    firstName: string;
    address: Address;
  };
  books: Book[];
}

export interface CheckoutSuccess {
  orderId: string;
  estimatedShipDate: string;
}

export type AddressErrors = Partial<Record<keyof Address, string>>;
