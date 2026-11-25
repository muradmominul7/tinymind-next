import Link from "next/link";
import { Suspense } from "react";
import CategoryNav from "./CategoryNav";
import LocaleSwitcher from "./LocaleSwitcher";
import MenuButton from "./MenuButton";
import MobileMenu from "./MobileMenu";
import ScrollHeader from "./ScrollHeader";
import CartLink from "./CartLink";
import SearchBox from "./SearchBox";
import { UserIcon } from "./icons";

// Wide screens: top bar (promo + language), then logo / search / cart row, then the category row.
// Scrolling down hides the top bar only; the rest stays sticky.
// Phones: logo row (hamburger, logo, language, cart, account) and the search row. Scrolling down hides the
// logo row; the hamburger and a cart icon then sit beside the search bar. The category strip is not sticky
// on phones; the hamburger opens the full category list.
export default function Header({ lang, t }) {
  const iconButton = "rounded-full p-2 text-heading hover:bg-secondary";
  const short = t.languageShort;

  return (
    <>
      <ScrollHeader>
        <div data-hdr-top className="hidden bg-brand text-sm text-white md:block">
          <div className="mx-auto grid max-w-site grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-1.5">
            <p className="col-start-2 text-center">
              {t.header.promo}{" "}
              <Link href={`/${lang}`} className="font-semibold underline">
                {t.header.shopNow}
              </Link>
            </p>
            <div className="col-start-3 flex justify-end">
              <Suspense fallback={null}>
                <LocaleSwitcher lang={lang} labels={short} variant="bar" />
              </Suspense>
            </div>
          </div>
        </div>

        <div className="border-b border-subtle bg-page">
          <div className="mx-auto max-w-site px-4 md:flex md:items-center md:gap-4 md:py-3">
            <div data-hdr-row className="flex items-center gap-1 py-2 md:contents">
              <MenuButton label={t.header.menu} closeLabel={t.header.menuClose} className={`${iconButton} -ml-2 md:hidden`} />

              <Link href={`/${lang}`} aria-label={t.site.name} className="mr-auto shrink-0 md:order-1 md:mr-0">
                <img src="/logo.svg" alt={t.site.name} className="h-10 w-auto md:h-12" />
              </Link>

              <div className="md:hidden">
                <Suspense fallback={null}>
                  <LocaleSwitcher lang={lang} labels={short} variant="compact" />
                </Suspense>
              </div>

              {/* Account comes in a later phase. */}
              <div className="flex items-center gap-1 md:order-3">
                <CartLink lang={lang} label={t.header.cart} />
                <button type="button" aria-label={t.header.account} className={iconButton}>
                  <UserIcon />
                </button>
              </div>
            </div>

            <div className="flex items-center pb-3 md:contents">
              {/* Phones: these two appear only while the logo row is hidden. */}
              <div className="hdr-compact-menu md:hidden">
                <MenuButton label={t.header.menu} closeLabel={t.header.menuClose} className={`${iconButton} -ml-2`} />
              </div>

              <div className="min-w-0 flex-1 md:order-2 md:ml-auto md:w-full md:max-w-lg md:flex-initial">
                <SearchBox
                  lang={lang}
                  labels={{
                    placeholder: t.header.searchPlaceholder,
                    button: t.header.searchButton,
                    viewAll: t.header.viewAll,
                    noResults: t.header.noResults,
                  }}
                />
              </div>

              <div className="hdr-compact-cart md:hidden">
                <CartLink lang={lang} label={t.header.cart} />
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:block">
          <CategoryNav lang={lang} />
        </div>
      </ScrollHeader>

      <div className="md:hidden">
        <CategoryNav lang={lang} />
      </div>

      <Suspense fallback={null}>
        <MobileMenu lang={lang} labels={{ signIn: t.header.signIn, signUp: t.header.signUp }} />
      </Suspense>
    </>
  );
}
