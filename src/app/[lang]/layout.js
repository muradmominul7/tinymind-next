import { Noto_Sans_Bengali } from "next/font/google";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getDictionary, isLocale, locales } from "@/lib/i18n";
import "../globals.css";

const font = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);

  return {
    title: t.site.title,
    description: t.site.description,
  };
}

export default async function RootLayout({ children, params }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);

  return (
    <html lang={lang} className={font.className}>
      <body className="min-h-screen bg-page text-body antialiased">
        <Header lang={lang} t={t} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6">{children}</main>
        <Footer t={t} />
      </body>
    </html>
  );
}
