import { notFound } from "next/navigation";
import { HeadphonesIcon, MailIcon, PhoneIcon, PinIcon } from "@/components/icons";
import { getDictionary, isLocale } from "@/lib/i18n";

const PHONE_HREF = "tel:09638977422";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);

  return { title: `${t.contact.title} | ${t.site.name}` };
}

export default async function ContactPage({ params }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const t = await getDictionary(lang);
  const c = t.contact;
  const f = t.footer;

  const cards = [
    { Icon: PinIcon, label: c.address, value: f.address },
    { Icon: PhoneIcon, label: c.phone, value: f.phone, href: PHONE_HREF },
    { Icon: MailIcon, label: c.email, value: f.email, href: `mailto:${f.email}` },
    { Icon: HeadphonesIcon, label: c.hours, value: c.hoursValue },
  ];

  return (
    <section className="mx-auto max-w-3xl py-8">
      <h1 className="text-center text-3xl font-bold text-heading">{c.title}</h1>
      <p className="mx-auto mt-3 max-w-xl text-center">{c.intro}</p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map(({ Icon, label, value, href }) => (
          <li key={label} className="flex items-start gap-4 rounded-2xl border border-subtle bg-secondary p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-white">
              <Icon className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-heading">{label}</p>
              {href ? (
                <a href={href} className="break-words text-lg hover:text-brand-alt">
                  {value}
                </a>
              ) : (
                <p className="text-lg">{value}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
