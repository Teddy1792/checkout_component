import type {
  Address,
  AddressErrors,
  CheckoutData,
  CheckoutSuccess,
} from "../types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isSafeString = (value: unknown, maxLength: number): value is string =>
  typeof value === "string" && value.length <= maxLength;

export function isCheckoutData(value: unknown): value is CheckoutData {
  if (!isRecord(value) || !isRecord(value.member)) return false;
  if (!isSafeString(value.member.firstName, 80)) return false;
  if (!isRecord(value.member.address) || !Array.isArray(value.books)) return false;

  const address = value.member.address;
  const addressIsValid =
    isSafeString(address.fullName, 100) &&
    isSafeString(address.addressLine1, 120) &&
    isSafeString(address.addressLine2, 120) &&
    isSafeString(address.city, 80) &&
    isSafeString(address.region, 30) &&
    isSafeString(address.postalCode, 12);

  const booksAreValid =
    value.books.length >= 1 &&
    value.books.length <= 4 &&
    value.books.every(
      (book) =>
        isRecord(book) &&
        isSafeString(book.id, 80) &&
        isSafeString(book.title, 160) &&
        isSafeString(book.author, 120) &&
        isSafeString(book.coverUrl, 200) &&
        book.coverUrl.startsWith("/covers/") &&
        typeof book.priceInCents === "number" &&
        Number.isSafeInteger(book.priceInCents) &&
        book.priceInCents >= 0 &&
        book.priceInCents <= 100_000 &&
        isSafeString(book.label, 40),
    );

  return addressIsValid && booksAreValid;
}

export function isCheckoutSuccess(value: unknown): value is CheckoutSuccess {
  return (
    isRecord(value) &&
    isSafeString(value.orderId, 80) &&
    /^[A-Z0-9-]+$/.test(value.orderId) &&
    isSafeString(value.estimatedShipDate, 30) &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.estimatedShipDate) &&
    !Number.isNaN(Date.parse(value.estimatedShipDate + "T12:00:00"))
  );
}

// Normalization removes invisible control characters without trying to render or
// interpret user-provided markup. React escapes every value when it is displayed.
export function normalizeAddress(address: Address): Address {
  const clean = (value: string) =>
    value
      .normalize("NFKC")
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  return {
    fullName: clean(address.fullName),
    addressLine1: clean(address.addressLine1),
    addressLine2: clean(address.addressLine2),
    city: clean(address.city),
    region: clean(address.region).toUpperCase(),
    postalCode: clean(address.postalCode),
  };
}

export function validateAddress(address: Address): AddressErrors {
  const errors: AddressErrors = {};

  if (address.fullName.length < 2 || address.fullName.length > 100) {
    errors.fullName = "Enter a name between 2 and 100 characters.";
  }
  if (address.addressLine1.length < 3 || address.addressLine1.length > 120) {
    errors.addressLine1 = "Enter a valid street address.";
  }
  if (address.addressLine2.length > 120) {
    errors.addressLine2 = "Keep apartment or suite details under 120 characters.";
  }
  if (address.city.length < 2 || address.city.length > 80) {
    errors.city = "Enter a valid city.";
  }
  if (!/^[A-Z]{2}$/.test(address.region)) {
    errors.region = "Use a 2-letter state code.";
  }
  if (!/^\d{5}(?:-\d{4})?$/.test(address.postalCode)) {
    errors.postalCode = "Use a 5-digit ZIP code (or ZIP+4).";
  }

  return errors;
}

export function getErrorMessage(value: unknown): string | null {
  if (!isRecord(value) || !isSafeString(value.error, 240)) return null;
  return value.error;
}
