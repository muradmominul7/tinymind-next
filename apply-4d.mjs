// One-time setup: adds the category toolbar texts to bn.json and en.json. Safe to run twice, removes nothing.
import { readFileSync, writeFileSync } from "node:fs";

const category = {
  bn: {
    sort: "সাজান",
    perPage: "প্রতি পেজে",
    gridView: "গ্রিড ভিউ",
    listView: "লিস্ট ভিউ",
    sortOptions: {
      "created_at-desc": "নতুন → পুরাতন",
      "created_at-asc": "পুরাতন → নতুন",
      "price-asc": "দাম: কম → বেশি",
      "price-desc": "দাম: বেশি → কম",
    },
  },
  en: {
    sort: "Sort by",
    perPage: "Per page",
    gridView: "Grid view",
    listView: "List view",
    sortOptions: {
      "created_at-desc": "Newest → Oldest",
      "created_at-asc": "Oldest → Newest",
      "price-asc": "Price: Low → High",
      "price-desc": "Price: High → Low",
    },
  },
};

for (const lang of ["bn", "en"]) {
  const file = new URL(`./src/dictionaries/${lang}.json`, import.meta.url);
  const json = JSON.parse(readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
  json.category = { ...(json.category || {}), ...category[lang] };
  writeFileSync(file, JSON.stringify(json, null, 2) + "\n", "utf8");
  console.log("updated", lang + ".json");
}
