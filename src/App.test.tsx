import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const checkoutData = {
  member: {
    firstName: "Alex",
    address: {
      fullName: "Alex Morgan",
      addressLine1: "184 Montague Street",
      addressLine2: "Apt 4B",
      city: "Brooklyn",
      region: "NY",
      postalCode: "11201",
    },
  },
  books: [
    {
      id: "civilwarland-in-bad-decline",
      title: "CivilWarLand in Bad Decline",
      author: "George Saunders",
      coverUrl: "/covers/civilwarland.jpg",
      priceInCents: 1799,
      label: "Member pick",
    },
    {
      id: "americanah",
      title: "Americanah",
      author: "Chimamanda Ngozi Adichie",
      coverUrl: "/covers/americanah.jpg",
      priceInCents: 1199,
      label: "Add-on",
    },
    {
      id: "tales-from-earthsea",
      title: "Tales from Earthsea",
      author: "Ursula K. Le Guin",
      coverUrl: "/covers/tales-from-earthsea.jpg",
      priceInCents: 1199,
      label: "Add-on",
    },
  ],
};

const jsonResponse = (body: unknown, ok = true) =>
  Promise.resolve({
    ok,
    json: () => Promise.resolve(body),
  } as Response);

describe("CheckoutPage", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    vi.stubGlobal("fetch", vi.fn(() => jsonResponse(checkoutData)));
  });

  it("loads the order and calculates the total from integer cents", async () => {
    render(<App />);

    expect(await screen.findByRole("heading", { name: "Your books" })).toBeInTheDocument();
    expect(screen.getByText("CivilWarLand in Bad Decline")).toBeInTheDocument();
    expect(screen.getByText("Americanah")).toBeInTheDocument();
    expect(screen.getByText("Tales from Earthsea")).toBeInTheDocument();
    expect(screen.getAllByText("$41.97")).toHaveLength(2);
    expect(screen.getByText("Fiction,")).toBeInTheDocument();
    expect(screen.getByText("Privacy policy")).toBeInTheDocument();
  });

  it("posts only the selected book IDs and renders a validated confirmation", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockImplementationOnce(() => jsonResponse(checkoutData))
      .mockImplementationOnce(() =>
        jsonResponse({ orderId: "BOTM-AB12CD34", estimatedShipDate: "2026-10-02" }),
      );

    render(<App />);
    await userEvent.click(await screen.findByRole("button", { name: /place order/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const [, request] = fetchMock.mock.calls[1];
    expect(request).toMatchObject({ method: "POST", credentials: "same-origin" });
    expect(JSON.parse(String(request?.body))).toEqual({
      bookIds: [
        "civilwarland-in-bad-decline",
        "americanah",
        "tales-from-earthsea",
      ],
    });
    expect(await screen.findByText(/BOTM-AB12CD34/)).toBeInTheDocument();
    expect(screen.getByText(/October 2, 2026/)).toBeInTheDocument();
  });

  it("disables checkout when all books are removed and lets the member recover", async () => {
    render(<App />);

    for (const title of [
      "CivilWarLand in Bad Decline",
      "Americanah",
      "Tales from Earthsea",
    ]) {
      await userEvent.click(
        await screen.findByRole("button", { name: "Remove " + title + " from your box" }),
      );
    }

    expect(screen.getByText("Your box is feeling a little light.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /place order/i })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: /restore my picks/i }));
    expect(screen.getByRole("button", { name: /place order/i })).toBeEnabled();
  });

  it("shows a safe server error and allows retrying checkout", async () => {
    window.history.replaceState({}, "", "/?simulateCheckoutError=1");
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockImplementationOnce(() => jsonResponse(checkoutData))
      .mockImplementationOnce(() => jsonResponse({ error: "The box sold out. Choose another title." }, false));

    render(<App />);
    await userEvent.click(await screen.findByRole("button", { name: /place order/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The box sold out. Choose another title.",
    );
    expect(screen.getByRole("heading", { name: "We couldn’t place your order" })).toBeInTheDocument();
    expect(fetchMock.mock.calls[1][0]).toBe("/api/checkout?simulateError=1");
    expect(screen.getByRole("button", { name: /place order/i })).toBeEnabled();
  });
});
