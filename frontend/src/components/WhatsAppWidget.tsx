import { Phone } from 'lucide-react';

const PHONE_NUMBER = "+917092264632";

export const WhatsAppWidget = () => {
  const openWhatsApp = () => {
    const encodedMessage = encodeURIComponent("Hi there!");
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={openWhatsApp}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20bd5a] transition-colors focus:outline-none focus:ring-4 focus:ring-green-300"
        aria-label="Contact us on WhatsApp"
      >
        <Phone className="h-6 w-6 fill-current" />
      </button>
    </div>
  );
};
