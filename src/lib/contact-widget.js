// Settings of the floating contact widget (WhatsApp, Messenger, Call).
// Numbers and links come from tinymind-next/.env.local (see CONTACT_* below), the texts of each language
// from src/dictionaries/contact-widget/<lang>.json. A channel without a value is not shown.
//
//   CONTACT_WHATSAPP_NUMBER=8801XXXXXXXXX   (country code, digits only)
//   CONTACT_MESSENGER_URL=https://m.me/yourpage
//   CONTACT_PHONE_NUMBER=+8801XXXXXXXXX
//   CONTACT_WIDGET_POSITION=right            (right or left)

const texts = {
  bn: () => import("@/dictionaries/contact-widget/bn.json").then((m) => m.default),
  en: () => import("@/dictionaries/contact-widget/en.json").then((m) => m.default),
};

const digits = (value) => String(value || "").replace(/[^\d]/g, "");

export async function getContactWidget(lang) {
  const whatsapp = digits(process.env.CONTACT_WHATSAPP_NUMBER);
  const messenger = (process.env.CONTACT_MESSENGER_URL || "").trim();
  const phone = (process.env.CONTACT_PHONE_NUMBER || "").trim().replace(/[^\d+]/g, "");

  if (!whatsapp && !messenger && !phone) return null;

  const t = await (texts[lang] ?? texts.en)();

  return {
    position: process.env.CONTACT_WIDGET_POSITION === "left" ? "left" : "right",
    whatsapp: whatsapp || null,
    messenger: messenger || null,
    phone: phone || null,
    t,
    // Short messages that float above the main button, one after another, while the widget is closed.
    nudge: {
      enabled: true,
      interval: 6000,
      visible: 3000,
      messages: [
        whatsapp && { channel: "whatsapp", text: t.channels.whatsapp },
        messenger && { channel: "messenger", text: t.channels.messenger },
        phone && { channel: "call", text: t.channels.call },
      ].filter(Boolean),
    },
  };
}
