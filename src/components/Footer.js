export default function Footer({ t }) {
  return (
    <footer className="mt-12 bg-heading text-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-lg font-bold">{t.site.name}</p>
        <p className="mt-1 text-sm opacity-80">{t.footer.tagline}</p>
        <p className="mt-6 text-xs opacity-70">
          © {t.site.name}. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
