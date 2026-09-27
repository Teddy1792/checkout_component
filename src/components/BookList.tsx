import { X } from "lucide-react";
import type { Book } from "../types";

interface BookListProps {
  books: Book[];
  formatMoney: (cents: number) => string;
  onRemove: (id: string) => void;
  onRestore: () => void;
  isLocked?: boolean;
}

export function BookList({ books, formatMoney, onRemove, onRestore, isLocked = false }: BookListProps) {
  if (books.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-brand/40 bg-blue-pale/40 px-6 py-12 text-center">
        <p className="font-display text-2xl text-ink">Your box is feeling a little light.</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
          Add at least one book before placing your order.
        </p>
        <button type="button" onClick={onRestore} className="button-primary mt-6">
          Restore my picks
        </button>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line" aria-label="Books in your order">
      {books.map((book) => (
        <li key={book.id} className="group flex gap-4 py-6 first:pt-0 sm:gap-6">
          <div className="relative shrink-0">
            <img
              src={book.coverUrl}
              alt={"Cover of " + book.title}
              width="108"
              height="162"
              className="h-[138px] w-[92px] rounded-[1px] object-cover shadow-book sm:h-[162px] sm:w-[108px]"
            />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-teal px-2 py-1 text-[9px] font-black uppercase tracking-[0.15em] text-ink">
              {book.label}
            </span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col py-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-[21px] leading-[1.15] text-ink sm:text-2xl">
                  {book.title}
                </h3>
                <p className="mt-2 text-sm text-muted">by {book.author}</p>
              </div>
              <p className="shrink-0 text-sm font-bold text-ink sm:text-base">
                {formatMoney(book.priceInCents)}
              </p>
            </div>
            <div className="mt-auto flex items-end justify-between gap-3 pt-4">
              <span className="text-xs font-bold uppercase tracking-[0.13em] text-brand">
                Hardcover
              </span>
              {!isLocked && (
                <button
                  type="button"
                  onClick={() => onRemove(book.id)}
                  className="flex min-h-11 items-center gap-1.5 px-1 text-xs font-bold text-muted hover:text-ink"
                  aria-label={"Remove " + book.title + " from your box"}
                >
                  <X size={15} aria-hidden="true" /> Remove
                </button>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
