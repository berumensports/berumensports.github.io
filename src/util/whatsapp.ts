export const buildWhatsAppLink = (phone: string, message: string) => {
  const text = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${text}`;
};
