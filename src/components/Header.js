import Link from "next/link";
import { Suspense } from "react";
import CategoryNav from "./CategoryNav";
import LocaleSwitcher from "./LocaleSwitcher";
import CartLink from "./CartLink";
import { UserIcon } from "./icons";

export default function Header({ lang, t }) {
  const other = lang === "bn" ? "en" : "bn";
  const iconButton = "rounded-full p-2 text-heading hover:bg-secondary";

  return (
    <header>
      <div className="bg-brand text-sm text-white">
        <div className="mx-auto flex max-w-site items-center justify-between gap-3 px-4 py-1.5 md:grid md:grid-cols-[1fr_auto_1fr]">
          <p className="md:col-start-2 md:text-center">
            {t.header.promo}{" "}
            <Link href={`/${lang}`} className="font-semibold underline">
              {t.header.shopNow}
            </Link>
          </p>
          <div className="flex shrink-0 justify-end md:col-start-3">
            <Suspense fallback={null}>
              <LocaleSwitcher lang={lang} label={t.language[other]} />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="border-b border-subtle bg-page">
        <div className="mx-auto flex max-w-site flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
          <Link href={`/${lang}`} aria-label={t.site.name} className="shrink-0">
            <img src="/logo.svg" alt={t.site.name} className="h-10 w-auto md:h-12" />
          </Link>

          <form
            action={`/${lang}/search`}
            className="order-last flex w-full items-center rounded-full bg-secondary pl-4 md:order-none md:ml-auto md:max-w-lg"
          >
            <input
              name="q"
              type="search"
              placeholder={t.header.searchPlaceholder}
              className="w-full bg-transparent py-2 text-sm outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white"
            >
              {t.header.searchButton}
            </button>
          </form>

          {/* Account comes in a later phase. */}
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <CartLink lang={lang} label={t.header.cart} />
            <button type="button" aria-label={t.header.account} className={iconButton}>
              <UserIcon />
            </button>
          </div>
        </div>
      </div>

      <CategoryNav lang={lang} />
    </header>
  );
}
