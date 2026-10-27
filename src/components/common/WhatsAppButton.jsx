import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * @file WhatsAppButton.jsx
 * @description Floating WhatsApp Support Button with official brand SVG and subtle pulse animation.
 * Opens WhatsApp Chat with pre-filled message directly via https://wa.me/
 */
export const WhatsAppButton = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  if (isAuthPage) return null;

  const rawNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '9852124942';
  // Normalize phone number to 91XXXXXXXXXX
  const digitsOnly = String(rawNumber).replace(/\D/g, '');
  const formattedNumber =
    digitsOnly.startsWith('91') && digitsOnly.length > 10
      ? digitsOnly
      : `91${digitsOnly.slice(-10)}`;

  const defaultMessage = encodeURIComponent(
    'Hello ChhotaBhai Support, I need help regarding products & orders.'
  );

  const whatsappUrl = `https://wa.me/${formattedNumber}?text=${defaultMessage}`;

  return (
    <div className="hidden lg:flex fixed bottom-6 right-6 z-50 items-center group">
      {/* Interactive Tooltip Pill */}
      <span className="hidden sm:inline-block max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:mr-3 transition-all duration-300 ease-out bg-slate-900 text-white text-xs font-bold py-1.5 px-3.5 rounded-full shadow-lg border border-slate-700">
        WhatsApp Support
      </span>

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="relative w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
      >
        {/* Subtle Ambient Pulse Ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/35 animate-ping pointer-events-none" />

        {/* Official WhatsApp Vector SVG */}
        <svg
          viewBox="0 0 24 24"
          width="32"
          height="32"
          fill="currentColor"
          className="relative z-10 drop-shadow-xs"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15ZM16.56 14.41C16.31 14.29 15.1 13.69 14.88 13.61C14.65 13.53 14.49 13.49 14.32 13.74C14.16 13.99 13.69 14.54 13.55 14.7C13.41 14.87 13.26 14.89 13.01 14.77C12.77 14.65 11.98 14.39 11.04 13.55C10.31 12.9 9.81 12.1 9.67 11.85C9.53 11.61 9.65 11.47 9.78 11.35C9.89 11.24 10.02 11.07 10.15 10.92C10.27 10.77 10.31 10.66 10.39 10.5C10.47 10.33 10.43 10.19 10.37 10.07C10.31 9.95 9.82 8.74 9.61 8.24C9.41 7.76 9.21 7.82 9.06 7.81C8.92 7.81 8.75 7.81 8.59 7.81C8.42 7.81 8.16 7.87 7.93 8.12C7.71 8.37 7.08 8.96 7.08 10.15C7.08 11.34 7.95 12.49 8.07 12.65C8.19 12.82 9.77 15.26 12.21 16.31C12.79 16.56 13.24 16.71 13.59 16.82C14.17 17.01 14.7 16.98 15.12 16.92C15.59 16.85 16.56 16.33 16.77 15.75C16.97 15.17 16.97 14.67 16.91 14.57C16.85 14.47 16.72 14.41 16.48 14.29L16.56 14.41Z"
          />
        </svg>
      </a>
    </div>
  );
};

export default WhatsAppButton;
