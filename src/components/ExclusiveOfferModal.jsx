import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

export default function ExclusiveOfferModal() {
  const [animate, setAnimate] = useState(false);
  const [show, setShow] = useState(false);
  if (typeof window === 'undefined') return null;

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (show) {
      // Trigger animation on next tick
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
    }
  }, [show]);

  if (!show) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 40,
      }}
    >
      <div
        id="exclusive-offer-modal-root"
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 transition-opacity"
      >
        <div
          className={`bg-white rounded-lg shadow-lg max-w-4xl w-full overflow-hidden relative transform transition-all duration-500 ${
            animate ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        >
          {/* Announcement Title */}
          <div
            className="flex items-center gap-3 px-6 py-4 justify-center"
            style={{ backgroundColor: '#3B82F6' }}
          >
            <span className="text-4xl">🎁</span>
            <span className="text-white text-xl font-bold uppercase tracking-wider">
              Exclusive Offer
            </span>
          </div>
          {/* Body */}
          <div className="flex flex-col md:flex-row px-6 py-6 items-center">
            {/* Text Column */}
            <div className="flex-1 md:pr-8 mb-6 md:mb-0">
              <span className="text-4xl font-bold text-blue-900 mb-2 underline">
                Free Meal Plan
              </span>
              <p className="text-lg pt-4 w-[90%]">
                On every purchase, a{' '}
                <span className="font-bold">Meal Plan</span> formulated by a
                licensed dietitian will be provided for{' '}
                <span className="font-bold">FREE</span>.
              </p>
            </div>
            {/* Image Column */}
            <div className="w-full md:w-48 flex-shrink-0 flex justify-center">
              <img
                src="/assets/images/meal.jpg"
                alt="Healthy meal with salad, tomatoes, broccoli, eggs"
                className="rounded-lg shadow-md w-40 h-40 object-cover bg-white"
                loading="lazy"
              />
            </div>
          </div>
          <button
            className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-700 focus:outline-none"
            aria-label="Close"
            onClick={() => setShow(false)}
          >
            &times;
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
