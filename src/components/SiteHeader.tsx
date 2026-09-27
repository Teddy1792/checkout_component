import { Menu, PackageOpen } from "lucide-react";

export function SiteHeader() {
  return (
    <>
      <div className="bg-lilac px-4 py-2.5 text-center text-[13px] font-semibold text-ink sm:text-sm">
        Your September box ships free.{" "}
        <a className="underline decoration-1 underline-offset-2" href="#order">
          See what’s inside.
        </a>
      </div>
      <header className="bg-brand text-white">
        <div className="site-container flex h-[74px] items-center justify-between sm:h-[88px]">
          <a
            href="#top"
            className="font-display text-[25px] leading-none italic tracking-[-0.045em] sm:text-[31px]"
            aria-label="Book of the Month home"
          >
            Book<span className="text-[0.55em]">of the</span>Month
          </a>

          <nav className="hidden items-center gap-8 text-sm font-semibold md:flex" aria-label="Main navigation">
            <a className="transition-opacity hover:opacity-75" href="#order">My box</a>
            <a className="transition-opacity hover:opacity-75" href="#books">All books</a>
            <a className="transition-opacity hover:opacity-75" href="#shipping">Membership</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="hidden items-center gap-2 rounded border border-white/80 px-4 py-2 text-sm font-semibold sm:flex"
            >
              <PackageOpen size={17} aria-hidden="true" /> My boxes
            </button>
            <button
              type="button"
              className="rounded bg-cream px-4 py-2 text-sm font-bold text-ink sm:px-5"
            >
              Account
            </button>
            <button type="button" className="ml-1 md:hidden" aria-label="Open menu">
              <Menu size={25} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
