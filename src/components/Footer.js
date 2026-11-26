import Link from "next/link";
import {
  DollarIcon,
  HeadphonesIcon,
  MailIcon,
  PackageIcon,
  PhoneIcon,
  PinIcon,
  TruckIcon,
} from "./icons";

// Every link opens /{lang}/{slug}. Most are CMS pages managed in the Bagisto admin panel.
const columns = [
  { title: "company", links: [["aboutUs", "about-us"], ["contact", "contact"]] },
  {
    title: "customer",
    links: [
      ["trackOrder", "track-order"],
      ["shippingPolicy", "shipping-policy"],
      ["allPolicies", "policies"],
    ],
  },
  { title: "legal", links: [["terms", "terms-conditions"], ["privacy", "privacy-policy"]] },
];

// The four boxes above the footer are the "Services Content" section of the Bagisto theme (admin: Appearance).
// Each box names its icon; a box with an icon we do not know gets the package icon.
const featureIcons = {
  "icon-truck": TruckIcon,
  "icon-product": PackageIcon,
  "icon-dollar-sign": DollarIcon,
  "icon-support": HeadphonesIcon,
};

const PHONE_HREF = "tel:09638977422";

export default function Footer({ lang, t }) {
  const f = t.footer;
  const year = new Intl.NumberFormat(lang === "bn" ? "bn-BD" : "en-US", {
    useGrouping: false,
  }).format(new Date().getFullYear());

  return (
    <footer className="mt-12">
      <div className="mx-auto grid max-w-site grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {(f.features ?? []).map((item) => {
          const Icon = featureIcons[item.icon] ?? PackageIcon;
          return (
            <div key={item.title} className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-heading text-heading">
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-lg font-semibold text-heading">{item.title}</p>
                <p className="text-sm">{item.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-brand text-white">
        <div className="mx-auto grid max-w-site gap-8 px-4 py-10 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <img src="/footer-logo.svg" alt={f.brand} className="h-11 w-auto" />
            <p className="mt-4 max-w-md leading-7 opacity-90">{f.about}</p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="mb-3 inline-block border-b border-white/40 pb-1 text-lg font-semibold">
                {f[col.title]}
              </h2>
              <ul className="space-y-2 text-sm">
                {col.links.map(([key, slug]) => (
                  <li key={slug}>
                    <Link href={slug.startsWith("#") ? slug : `/${lang}/${slug}`} className="opacity-90 hover:text-accent hover:opacity-100">
                      {f.links?.[key]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/15">
          <div id="contact" className="mx-auto flex max-w-site flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-4 text-sm">
            <span className="flex items-center gap-2">
              <PinIcon className="h-4 w-4 shrink-0" />
              {f.address}
            </span>
            <a href={PHONE_HREF} className="flex items-center gap-2 hover:text-accent">
              <PhoneIcon className="h-4 w-4 shrink-0" />
              {f.phone}
            </a>
            <a href={`mailto:${f.email}`} className="flex items-center gap-2 hover:text-accent">
              <MailIcon className="h-4 w-4 shrink-0" />
              {f.email}
            </a>
          </div>
        </div>

        <div className="border-t border-white/15 py-3 text-center text-sm opacity-90">
          {(f.copyright ?? "").replace(":year", year)}
        </div>
      </div>
    </footer>
  );
}
