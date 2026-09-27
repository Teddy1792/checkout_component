import { ArrowRight, CheckCircle2, LoaderCircle, LockKeyhole, PackageCheck, Truck } from "lucide-react";

interface OrderSummaryProps {
  bookCount: number;
  subtotal: number;
  formatMoney: (cents: number) => string;
  isSubmitting: boolean;
  hasOrder: boolean;
  onPlaceOrder: () => void;
}

export function OrderSummary({
  bookCount,
  subtotal,
  formatMoney,
  isSubmitting,
  hasOrder,
  onPlaceOrder,
}: OrderSummaryProps) {
  return (
    <aside className="lg:sticky lg:top-6 lg:self-start" aria-labelledby="summary-title">
      <div className="overflow-hidden rounded-sm bg-white shadow-card">
        <div className="border-b border-line px-6 py-5 sm:px-7">
          <p className="eyebrow">Almost there</p>
          <h2 id="summary-title" className="mt-1 font-display text-[28px] text-ink">Order summary</h2>
        </div>
        <div className="space-y-4 px-6 py-6 text-sm sm:px-7">
          <div className="flex justify-between gap-4 text-muted">
            <span>Books ({bookCount})</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <div className="flex justify-between gap-4 text-muted">
            <span>Shipping</span>
            <span className="font-bold uppercase tracking-[0.08em] text-teal-dark">Free</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-line pt-5 text-lg font-bold text-ink">
            <span>Total</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
        </div>
        <div className="px-6 pb-6 sm:px-7">
          <button
            id="place-order"
            type="button"
            onClick={onPlaceOrder}
            disabled={bookCount === 0 || isSubmitting || hasOrder}
            aria-busy={isSubmitting}
            className="button-primary w-full"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="animate-spin" size={21} strokeWidth={2.6} aria-hidden="true" />
                Placing your order…
              </>
            ) : hasOrder ? (
              <><CheckCircle2 size={19} aria-hidden="true" /> Order placed</>
            ) : (
              <>Place order <ArrowRight size={19} aria-hidden="true" /></>
            )}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] leading-4 text-muted">
            <LockKeyhole size={12} aria-hidden="true" /> Secure checkout · No payment due today
          </p>
        </div>
        <div className="grid grid-cols-2 border-t border-line bg-cream/70 text-center text-[11px] font-bold uppercase tracking-[0.09em] text-muted">
          <div className="flex items-center justify-center gap-2 border-r border-line px-2 py-4">
            <Truck size={16} className="text-brand" aria-hidden="true" /> Free shipping
          </div>
          <div className="flex items-center justify-center gap-2 px-2 py-4">
            <PackageCheck size={16} className="text-brand" aria-hidden="true" /> Carefully packed
          </div>
        </div>
      </div>
    </aside>
  );
}
