const FALLBACK_WHATSAPP_NUMBER = '201000000000';

export const normalizeWhatsAppNumber = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return FALLBACK_WHATSAPP_NUMBER;

  // Support local numbers like 010xxxxxxxx by defaulting to Egypt country code.
  if (digits.startsWith('0') && digits.length >= 10) {
    return `20${digits.replace(/^0+/, '')}`;
  }

  return digits;
};

export const buildWhatsAppLink = ({ number, message = '' }) => {
  const normalizedNumber = normalizeWhatsAppNumber(number);
  const text = String(message || '').trim();
  const suffix = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${normalizedNumber}${suffix}`;
};

export const getDefaultWhatsAppNumber = () => FALLBACK_WHATSAPP_NUMBER;

