import CartWidget from "@/components/CartWidget";
import ContactWidget from "@/components/ContactWidget";
import Footer from "@/components/Footer";
import FooterGate from "@/components/FooterGate";
import Header from "@/components/Header";
import { getContactWidget } from "@/lib/contact-widget";
import {
  getDictionary,
  getLocales,
  getLocaleSettings,
  isLocale,
} from "@/lib/i18n";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import "../globals.css";

// Self-hosted fonts (files live in src/fonts). Roles: Baloo 2 = headings and navigation,
// Inter = Latin text, Hind Siliguri = Bengali text (Inter has no Bengali, so the browser falls through to it).
const baloo = localFont({
  src: "../../fonts/Baloo2-Variable.woff2",
  weight: "400 800",
  variable: "--font-baloo",
  display: "swap",
});

const inter = localFont({
  src: "../../fonts/Inter-Variable.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
});

const hind = localFont({
  src: [
    {
      path: "../../fonts/HindSiliguri-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../fonts/HindSiliguri-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../fonts/HindSiliguri-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../fonts/HindSiliguri-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-hind",
  display: "swap",
});

export async function generateStaticParams() {
  return (await getLocales()).map((lang) => ({ lang }));
}

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!(await isLocale(lang))) return {};
  const t = await getDictionary(lang);

  return {
    title: t.site.title,
    description: t.site.description,
  };
}

export default async function RootLayout({ children, params }) {
  const { lang } = await params;
  if (!(await isLocale(lang))) notFound();
  const t = await getDictionary(lang);
  const { locales } = await getLocaleSettings();
  const contact = await getContactWidget(lang);
  const direction = locales.find((l) => l.code === lang)?.direction ?? "ltr";

  return (
    <html
      lang={lang}
      dir={direction}
      className={`${baloo.variable} ${inter.variable} ${hind.variable}`}
    >
      <body className="min-h-screen bg-page text-body antialiased">
        <Header lang={lang} t={t} />
        <main className="mx-auto w-full max-w-site px-4 py-6">{children}</main>
        <FooterGate>
          <Footer lang={lang} t={t} />
        </FooterGate>
        <CartWidget
          lang={lang}
          labels={{
            cart: t.header.cart,
            title: t.cart.drawerTitle,
            close: t.cart.close,
            items: t.cart.items,
            empty: t.cart.empty,
            continue: t.cart.continue,
            total: t.cart.total,
            checkout: t.cart.checkout,
            viewCart: t.cart.viewCart,
            quantity: t.cart.quantity,
            decrease: t.cart.decrease,
            increase: t.cart.increase,
            remove: t.cart.remove,
          }}
        />
        {contact && <ContactWidget config={contact} />}
      </body>
    </html>
  );
}
