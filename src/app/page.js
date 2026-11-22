import { bagistoFetch } from "@/lib/bagisto";
import { Suspense } from "react";

async function ProductList() {
  const products = await bagistoFetch("/products?per_page=12");

  return (
    <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {products.map((p) => (
        <li key={p.id} className="rounded-lg border p-3">
          <img
            src={p.baseImageUrl}
            alt={p.name}
            className="mb-2 w-full rounded"
          />
          <p className="font-semibold">{p.name}</p>
          <p>{p.formattedSpecialPrice || p.formattedPrice}</p>
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-bold">API connection test</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <ProductList />
      </Suspense>
    </main>
  );
}
