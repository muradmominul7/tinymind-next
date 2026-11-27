import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import { getAuthTexts } from "@/lib/auth-texts";
import { getCustomerToken } from "@/lib/customer";
import { isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!(await isLocale(lang))) return {};

  return { title: (await getAuthTexts(lang)).forgot.title };
}

export default async function ForgotPasswordPage({ params }) {
  const { lang } = await params;
  if (!(await isLocale(lang))) notFound();

  if (await getCustomerToken()) redirect(`/${lang}/account`);

  const { forgot } = await getAuthTexts(lang);

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-subtle bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-heading">{forgot.title}</h1>
      <p className="mb-5 mt-1 text-sm text-body">{forgot.subtitle}</p>

      <ForgotPasswordForm lang={lang} labels={forgot} />

      <p className="mt-5 text-center text-sm">
        <Link href={`/${lang}/login`} className="font-semibold text-brand underline">
          {forgot.back}
        </Link>
      </p>
    </div>
  );
}
