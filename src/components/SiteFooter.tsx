import { Instagram } from "lucide-react";

const footerGroups = [
  {
    title: "Pick a book",
    links: ["Current books", "All books", "The Lolly"],
  },
  {
    title: "About BOTM",
    links: [
      "About us",
      "Centennial",
      "Nobody reads anymore",
      "BOTM Live",
      "Relationship Status",
      "VOLUME Ø",
      "Aspen Literary Festival",
      "Recent Press",
      "Sign up",
    ],
  },
  {
    title: "Gifts",
    links: ["Give a gift", "Redeem a gift", "Group gifting"],
  },
  {
    title: "Get in touch",
    links: ["Help center", "Careers"],
  },
];

function FooterGroup({ title, links }: { title: string; links: string[] }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink">
        {title}
      </h2>
      <ul className="mt-3 space-y-2.5 text-[13px] text-ink">
        {links.map((link) => (
          <li key={link}>
            <a className="footer-link" href="#top">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white text-ink">
      <div className="site-container grid gap-x-8 gap-y-10 py-14 sm:grid-cols-2 sm:py-16 md:grid-cols-3 lg:grid-cols-[1.65fr_0.8fr_1.15fr_0.8fr_0.85fr_1fr] lg:py-20">
        <p className="whitespace-nowrap font-display text-[31px] leading-tight sm:col-span-2 md:col-span-3 lg:col-span-1 lg:text-[34px]">
          Fiction, <em>forward.</em>
        </p>

        {footerGroups.map((group) => (
          <FooterGroup key={group.title} {...group} />
        ))}

        <div className="sm:col-span-2 md:col-span-1 lg:col-span-1">
          <a
            href="#top"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-bold hover:text-brand"
          >
            <span className="flex size-6 items-center justify-center rounded-[7px] bg-gradient-to-br from-purple-600 via-pink-500 to-amber-400 text-white">
              <Instagram size={16} aria-hidden="true" />
            </span>
            Instagram
          </a>
          <div className="mt-8 flex flex-wrap items-center gap-3 lg:flex-col lg:items-start">
            <a
              href="#top"
              className="block h-[45px] w-[135px] overflow-hidden rounded-[5px] transition-opacity hover:opacity-80"
              aria-label="Download on the App Store"
            >
              <img
                src="/store-badges/download-on-the-app-store.svg"
                alt="Download on the App Store"
                width="135"
                height="45"
                className="h-full w-full"
              />
            </a>
            {/* The official Google PNG includes transparent outer padding. This
                viewport keeps its visible badge at the same 135 × 45 size. */}
            <a
              href="#top"
              className="relative block h-[45px] w-[135px] overflow-hidden rounded-[5px] transition-opacity hover:opacity-80"
              aria-label="Get it on Google Play"
            >
              <img
                src="/store-badges/get-it-on-google-play.png"
                alt="Get it on Google Play"
                width="155"
                height="67"
                className="absolute max-w-none"
                style={{
                  width: "154.63px",
                  height: "66.96px",
                  left: "-9.82px",
                  top: "-10.98px",
                }}
              />
            </a>
          </div>
        </div>
      </div>

      <div className="grid h-2 grid-cols-7" aria-hidden="true">
        <span className="bg-[#f6b711]" />
        <span className="bg-[#e979b4]" />
        <span className="bg-[#12669c]" />
        <span className="bg-[#36a253]" />
        <span className="bg-[#6fc1dc]" />
        <span className="bg-[#ac92c4]" />
        <span className="bg-[#d94826]" />
      </div>

      <div className="site-container flex flex-col gap-5 py-8 text-[10px] leading-5 text-muted lg:flex-row lg:flex-nowrap lg:items-center lg:justify-between lg:py-10">
        <p className="lg:whitespace-nowrap">
          ©2026 Book of the Month LLC. Book-of-the-Month and Book-of-the-Month Club are registered trademarks of Book of the Month LLC.
        </p>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2 lg:flex-nowrap">
          {[
            "Accessibility statement",
            "Privacy policy",
            "Terms of use",
            "Privacy choices",
          ].map((link) => (
            <a key={link} href="#top" className="footer-link whitespace-nowrap">
              {link}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
