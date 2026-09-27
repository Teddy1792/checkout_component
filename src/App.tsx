import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, CheckCircle2, RotateCcw } from "lucide-react";
import { AddressCard } from "./components/AddressCard";
import { BookList } from "./components/BookList";
import { OrderSummary } from "./components/OrderSummary";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { getErrorMessage, isCheckoutData, isCheckoutSuccess } from "./lib/validation";
import type { Address, Book, CheckoutData, CheckoutSuccess } from "./types";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: CheckoutData };

const formatMoney = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);

function CheckoutSkeleton() {
  return (
    <main className="site-container py-14" aria-busy="true" aria-label="Loading checkout">
      <div className="h-5 w-32 animate-pulse rounded bg-line" />
      <div className="mt-4 h-12 w-72 max-w-full animate-pulse rounded bg-line" />
      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {[0, 1, 2].map((item) => (
            <div key={item} className="flex gap-5 border-b border-line pb-6">
              <div className="h-40 w-28 animate-pulse bg-line" />
              <div className="flex-1 space-y-3 pt-2">
                <div className="h-6 w-3/4 animate-pulse rounded bg-line" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-line" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-sm bg-white shadow-card" />
      </div>
    </main>
  );
}

function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-red-100 text-red-700">
        <AlertCircle size={27} aria-hidden="true" />
      </div>
      <h1 className="mt-6 font-display text-4xl text-ink">We couldn’t open your box.</h1>
      <p className="mt-3 leading-7 text-muted">{message}</p>
      <button type="button" onClick={onRetry} className="button-primary mt-7">
        <RotateCcw size={18} aria-hidden="true" /> Try again
      </button>
    </main>
  );
}

export function CheckoutPage() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [books, setBooks] = useState<Book[]>([]);
  const [originalBooks, setOriginalBooks] = useState<Book[]>([]);
  const [address, setAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [order, setOrder] = useState<CheckoutSuccess | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCheckout() {
      setLoadState({ status: "loading" });
      try {
        const response = await fetch("/data/checkout.json", {
          signal: controller.signal,
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("The order details are temporarily unavailable.");
        const payload: unknown = await response.json();
        if (!isCheckoutData(payload)) throw new Error("The order data wasn’t in the expected format.");

        setBooks(payload.books);
        setOriginalBooks(payload.books);
        setAddress(payload.member.address);
        setLoadState({ status: "ready", data: payload });
      } catch (error) {
        if (controller.signal.aborted) return;
        setLoadState({
          status: "error",
          message: error instanceof Error ? error.message : "Please try again in a moment.",
        });
      }
    }

    void loadCheckout();
    return () => controller.abort();
  }, [loadAttempt]);

  const subtotal = useMemo(
    () => books.reduce((total, book) => total + book.priceInCents, 0),
    [books],
  );

  const removeBook = useCallback((bookId: string) => {
    if (order) return;
    setBooks((current) => current.filter((book) => book.id !== bookId));
    setSubmitError(null);
  }, [order]);

  const placeOrder = async () => {
    if (isSubmitting || order) return;
    if (books.length < 1 || books.length > 4) {
      setSubmitError("Your box needs between 1 and 4 books before checkout.");
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12_000);
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const shouldSimulateError =
        import.meta.env.DEV &&
        new URLSearchParams(window.location.search).get("simulateCheckoutError") === "1";
      const checkoutEndpoint = shouldSimulateError
        ? "/api/checkout?simulateError=1"
        : "/api/checkout";

      const response = await fetch(checkoutEndpoint, {
        method: "POST",
        credentials: "same-origin",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ bookIds: books.map((book) => book.id) }),
      });

      let payload: unknown = null;
      try {
        payload = await response.json();
      } catch {
        // A non-JSON response is handled below as an invalid server response.
      }

      if (!response.ok) {
        throw new Error(getErrorMessage(payload) ?? "Please try again in a moment.");
      }
      if (!isCheckoutSuccess(payload)) {
        throw new Error("We received an unexpected response. Your order was not confirmed.");
      }

      setOrder(payload);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitError(
        controller.signal.aborted
          ? "The request took too long. Please check your connection and try again."
          : error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      );
    } finally {
      window.clearTimeout(timeout);
      setIsSubmitting(false);
    }
  };

  if (loadState.status === "loading") {
    return <><SiteHeader /><CheckoutSkeleton /></>;
  }

  if (loadState.status === "error") {
    return <><SiteHeader /><LoadError message={loadState.message} onRetry={() => setLoadAttempt((value) => value + 1)} /></>;
  }

  if (!address) return null;

  return (
    <div id="top" className="min-h-screen bg-cream text-ink">
      <SiteHeader />
      <main id="order">
        <section className="border-b border-line bg-white">
          <div className="site-container py-10 text-center sm:py-14">
            <p className="eyebrow">September’s box</p>
            <h1 className="mt-2 font-display text-[40px] leading-[1.05] tracking-[-0.02em] text-ink sm:text-[56px]">
              Review your good reads.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted sm:text-base">
              Check your picks and shipping details, then we’ll get your books on their way.
            </p>
            <ol className="mx-auto mt-8 flex max-w-md items-center" aria-label="Checkout progress">
              <li className="flex flex-1 items-center gap-2 text-xs font-bold text-brand">
                <span className="flex size-6 items-center justify-center rounded-full bg-brand text-white"><Check size={14} /></span>
                Pick books
              </li>
              <li className="h-px flex-1 bg-brand" aria-hidden="true" />
              <li className="flex flex-1 items-center justify-end gap-2 text-xs font-bold text-brand">
                <span className="flex size-6 items-center justify-center rounded-full bg-brand text-white">2</span>
                Review
              </li>
            </ol>
          </div>
        </section>

        <div className="site-container py-10 sm:py-14">
          {order && (
            <section
              className="mb-8 flex items-start gap-4 border border-teal-dark/20 bg-[#eaf8f4] p-5 sm:p-6"
              role="status"
              aria-live="polite"
            >
              <CheckCircle2 className="mt-0.5 shrink-0 text-teal-dark" size={25} aria-hidden="true" />
              <div>
                <h2 className="font-display text-2xl text-ink">Your box is booked!</h2>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Order <strong className="text-ink">{order.orderId}</strong> is confirmed and is estimated to ship on{" "}
                  <strong className="text-ink">
                    {new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
                      new Date(order.estimatedShipDate + "T12:00:00"),
                    )}
                  </strong>.
                </p>
              </div>
            </section>
          )}

          {submitError && (
            <div
              className="mb-10 flex items-start gap-4 border border-red-200 border-l-4 border-l-red-600 bg-white p-5 text-red-900 shadow-card sm:gap-5 sm:p-6"
              role="alert"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
                <AlertCircle size={21} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-[22px] leading-tight text-ink">
                  We couldn’t place your order
                </h2>
                <p className="mt-2 text-sm leading-6 text-red-900">{submitError}</p>
              </div>
              <button
                type="button"
                onClick={() => setSubmitError(null)}
                className="min-h-11 shrink-0 px-2 text-xs font-bold uppercase tracking-[0.08em] text-red-800 underline underline-offset-4"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-16">
            <div>
              <section id="books" aria-labelledby="books-title">
                <div className="mb-7 flex items-end justify-between gap-5">
                  <div>
                    <p className="eyebrow">In this box</p>
                    <h2 id="books-title" className="mt-1 font-display text-[30px] leading-tight text-ink sm:text-[34px]">
                      Your books
                    </h2>
                  </div>
                  <p className="pb-1 text-sm text-muted">
                    {books.length} {books.length === 1 ? "item" : "items"} selected
                  </p>
                </div>
                <BookList
                  books={books}
                  formatMoney={formatMoney}
                  onRemove={removeBook}
                  onRestore={() => { setBooks(originalBooks); setSubmitError(null); }}
                  isLocked={Boolean(order)}
                />
              </section>

              <div className="mt-10">
                <AddressCard address={address} onSave={setAddress} isLocked={Boolean(order)} />
              </div>
            </div>

            <OrderSummary
              bookCount={books.length}
              subtotal={subtotal}
              formatMoney={formatMoney}
              isSubmitting={isSubmitting}
              hasOrder={Boolean(order)}
              onPlaceOrder={placeOrder}
            />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export default function App() {
  return <CheckoutPage />;
}
