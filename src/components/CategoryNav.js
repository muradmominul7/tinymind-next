import Link from "next/link";
import { categoryHref, getTopCategories } from "@/lib/categories";

export default async function CategoryNav({ lang }) {
  let categories = [];

  try {
    categories = await getTopCategories(lang);
  } catch (error) {
    console.error("CategoryNav: could not load categories", error);
  }

  if (!categories.length) return null;

  return (
    <nav className="bg-brand text-white">
      <ul className="mx-auto flex max-w-site gap-7 overflow-x-auto whitespace-nowrap px-4 py-2.5 font-display text-base font-semibold">
        {categories.map((c) => (
          <li key={c.id}>
            <Link href={categoryHref(lang, c)} className="hover:text-accent">
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
