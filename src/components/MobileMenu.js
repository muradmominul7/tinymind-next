import { categoryHref, getTopCategories } from "@/lib/categories";
import MenuDrawer from "./MenuDrawer";

// Loads the categories on the server and hands them to the menu panel.
export default async function MobileMenu({ lang, labels }) {
  let categories = [];

  try {
    categories = await getTopCategories(lang);
  } catch (error) {
    console.error("MobileMenu: could not load categories", error);
  }

  const items = categories.map((c) => ({ id: c.id, name: c.name, href: categoryHref(lang, c) }));

  return <MenuDrawer lang={lang} labels={labels} items={items} />;
}
