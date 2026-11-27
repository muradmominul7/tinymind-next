import Link from "next/link";
import { notFound } from "next/navigation";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import { getAuthTexts } from "@/lib/auth-texts";
import { isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!(await isLocale(lang))) return {};

  return { title: (await getAuthTexts(lang)).reset.title, robots: { index: false } };
}

export default async function ResetPasswordPage({ params, searchParams }) {
  const { lang } = await params;
  if (!(await isLocale(lang))) notFound();

  const { token, email } = await searchParams;
  const { reset, common } = await getAuthTexts(lang);
  const valid = typeof token === "string" && token && typeof email === "string" && email;

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-subtle bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-heading">{reset.title}</h1>

      {valid ? (
        <>
          <p className="mb-5 mt-1 text-sm text-body">{reset.subtitle}</p>
          <ResetPasswordForm lang={lang} token={token} email={email} labels={reset} common={common} />
        </>
      ) : (
        <>
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {reset.invalidLink}
          </p>
          <p className="mt-5 text-center text-sm">
            <Link href={`/${lang}/forgot-password`} className="font-semibold text-brand underline">
              {reset.again}
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
