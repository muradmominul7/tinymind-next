import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { getAuthTexts } from "@/lib/auth-texts";
import { getCustomerToken } from "@/lib/customer";
import { isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!(await isLocale(lang))) return {};

  return { title: (await getAuthTexts(lang)).login.title };
}

export default async function LoginPage({ params, searchParams }) {
  const { lang } = await params;
  if (!(await isLocale(lang))) notFound();

  // Someone who is signed in has no use for this page.
  if (await getCustomerToken()) redirect(`/${lang}/account`);

  const { registered, reset } = await searchParams;
  const { login, common } = await getAuthTexts(lang);

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-subtle bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-heading">{login.title}</h1>
      <p className="mb-5 mt-1 text-sm text-body">{login.subtitle}</p>

      {registered && (
        <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{login.registered}</p>
      )}

      {reset && (
        <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{login.resetDone}</p>
      )}

      <LoginForm lang={lang} labels={login} common={common} />

      <p className="mt-5 text-center text-sm text-body">
        {login.noAccount}{" "}
        <Link href={`/${lang}/register`} className="font-semibold text-brand underline">
          {login.registerLink}
        </Link>
      </p>
    </div>
  );
}
