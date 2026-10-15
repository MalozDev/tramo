/**
 * WhatsApp fields accept either a full link (https://wa.me/260…) or a plain
 * phone number (+260 972 336 313). Normalise either form to a usable URL.
 */
export function whatsappHref(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return `https://wa.me/${digits}`;
}
