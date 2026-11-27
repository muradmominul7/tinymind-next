import { notFound, redirect } from "next/navigation";
import ChangeEmailForm from "@/components/ChangeEmailForm";
import { logoutAction } from "@/actions/auth";
import { getAuthTexts } from "@/lib/auth-texts";
import { customerApi, FALLBACK_EMAIL_DOMAIN, firstItem, getCustomerToken, listItems } from "@/lib/customer";
import { isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!(await isLocale(lang))) return {};

  return { title: (await getAuthTexts(lang)).account.title };
}

// One call for the account page. A failure is returned, not thrown, so the page can still be drawn.
async function load(path, token, lang) {
  try {
    return { data: await customerApi(path, { token, locale: lang }) };
  } catch (error) {
    console.error(`account: ${path} failed`, error.status ?? "", error.message, error.detail ?? "");
    return { error };
  }
}

const pick = (object, ...keys) => {
  for (const key of keys) if (object?.[key] != null && object[key] !== "") return object[key];
  return null;
};

export default async function AccountPage({ params, searchParams }) {
  const { lang } = await params;
  const { email: emailNotice } = await searchParams;
  if (!(await isLocale(lang))) notFound();

  const token = await getCustomerToken();
  if (!token) redirect(`/${lang}/login`);

  const [profileResult, ordersResult] = await Promise.all([
    load("/customer-profile", token, lang),
    load("/customer-orders", token, lang),
  ]);

  // Bagisto no longer accepts this token: clear the cookies and sign in again.
  if ([profileResult, ordersResult].some((r) => r.error?.status === 401)) {
    redirect(`/api/auth/reset?lang=${lang}`);
  }

  const { account, common } = await getAuthTexts(lang);
  const profile = profileResult.error ? null : firstItem(profileResult.data);
  const orders = ordersResult.error ? null : listItems(ordersResult.data);

  const name = [pick(profile, "firstName", "first_name"), pick(profile, "lastName", "last_name")]
    .filter((part) => part && part !== "-")
    .join(" ");
  const emailValue = pick(profile, "email");
  const email = emailValue && !String(emailValue).endsWith(`@${FALLBACK_EMAIL_DOMAIN}`) ? emailValue : null;
  const phone = pick(profile, "phone");

  const locale = lang === "bn" ? "bn-BD" : "en-US";
  const number = new Intl.NumberFormat(locale);

  const sorted = (orders ?? [])
    .slice()
    .sort((a, b) => new Date(pick(b, "createdAt", "created_at") ?? 0) - new Date(pick(a, "createdAt", "created_at") ?? 0))
    .slice(0, 10);

  const row = "flex justify-between gap-4 border-b border-subtle py-2 last:border-0";

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-heading">{account.title}</h1>

      <section className="rounded-2xl border border-subtle bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-heading">{account.profile}</h2>

        {profileResult.error ? (
          <p className="text-sm text-body">{account.profileFailed}</p>
        ) : (
          <dl className="text-sm">
            {name && (
              <div className={row}>
                <dt className="text-body">{account.name}</dt>
                <dd className="font-medium text-heading">{name}</dd>
              </div>
            )}
            {email && (
              <div className={row}>
                <dt className="text-body">{account.email}</dt>
                <dd className="font-medium text-heading">{email}</dd>
              </div>
            )}
            {phone && (
              <div className={row}>
                <dt className="text-body">{account.phone}</dt>
                <dd className="font-medium text-heading">{phone}</dd>
              </div>
            )}
          </dl>
        )}
      </section>

      {!profileResult.error && (
        <section className="rounded-2xl border border-subtle bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-heading">{account.emailTitle}</h2>

          {emailNotice === "updated" && (
            <p className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{account.emailUpdated}</p>
          )}
          {!email && <p className="mb-3 text-sm text-body">{account.addEmailNotice}</p>}

          <ChangeEmailForm lang={lang} labels={account} common={common} hasEmail={Boolean(email)} />
        </section>
      )}

      <section className="rounded-2xl border border-subtle bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-heading">{account.orders}</h2>

        {orders === null ? (
          <p className="text-sm text-body">{account.ordersFailed}</p>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-body">{account.noOrders}</p>
        ) : (
          <ul className="space-y-2">
            {sorted.map((order, index) => {
              const created = new Date(pick(order, "createdAt", "created_at") ?? "");
              const total = Number(pick(order, "grandTotal", "grand_total", "baseGrandTotal"));
              const status = String(pick(order, "status") ?? "");

              return (
                <li
                  key={pick(order, "id") ?? index}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-subtle p-3"
                >
                  <div>
                    <p className="font-semibold text-heading">
                      {account.order} #{pick(order, "incrementId", "increment_id", "id")}
                    </p>
                    {!Number.isNaN(created.getTime()) && (
                      <p className="text-sm text-body">{created.toLocaleDateString(locale)}</p>
                    )}
                  </div>
                  <div className="text-right text-sm">
                    {Number.isFinite(total) && <p className="font-semibold text-heading">৳ {number.format(total)}</p>}
                    {status && <p className="text-body">{account.statuses[status.toLowerCase()] ?? status}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <form action={logoutAction.bind(null, lang)}>
        <button type="submit" className="rounded-lg border border-subtle px-4 py-2 text-sm font-semibold text-heading hover:bg-secondary">
          {account.logout}
        </button>
      </form>
    </div>
  );
}
