import { describe, expect, it } from "vitest";
import { isCheckoutData, normalizeAddress, validateAddress } from "./validation";

describe("input and response validation", () => {
  it("normalizes invisible input while leaving markup inert for React to escape", () => {
    const address = normalizeAddress({
      fullName: "  <script>alert(1)</script>\u0000 Alex  ",
      addressLine1: "  10   Main St  ",
      addressLine2: "",
      city: " New York ",
      region: "ny",
      postalCode: "10001",
    });

    expect(address.fullName).toBe("<script>alert(1)</script> Alex");
    expect(address.addressLine1).toBe("10 Main St");
    expect(address.region).toBe("NY");
    expect(validateAddress(address)).toEqual({});
  });

  it("rejects unexpected remote cover URLs in fetched mock data", () => {
    expect(
      isCheckoutData({
        member: {
          firstName: "A",
          address: {
            fullName: "Alex Morgan",
            addressLine1: "10 Main St",
            addressLine2: "",
            city: "New York",
            region: "NY",
            postalCode: "10001",
          },
        },
        books: [
          {
            id: "book",
            title: "Book",
            author: "Author",
            coverUrl: "javascript:alert(1)",
            priceInCents: 1000,
            label: "Pick",
          },
        ],
      }),
    ).toBe(false);
  });
});
