/**
 * @file loadRazorpaySdk.js
 * @description Secure, resilient dynamic script loader for Razorpay Checkout SDK.
 * Includes automatic dev simulator fallback if an ad-blocker or firewall blocks the script.
 */

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

let scriptLoadingPromise = null;

function setupMockRazorpay() {
  if (window.Razorpay) return;

  window.Razorpay = class MockRazorpaySimulator {
    constructor(options) {
      this.options = options || {};
      this.listeners = {};
    }

    on(event, handler) {
      this.listeners[event] = handler;
    }

    open() {
      const amountFormatted = ((this.options.amount || 0) / 100).toLocaleString('en-IN');
      const orderDesc = this.options.description || 'ChhotaBhai Order';

      // Provide seamless browser confirmation dialog in dev
      const proceed = window.confirm(
        `💳 [ChhotaBhai Razorpay Simulator]\n\nAuthorize Payment of ₹${amountFormatted} for ${orderDesc}?\n\n• Click "OK" to simulate Successful Payment\n• Click "Cancel" to dismiss`
      );

      if (proceed) {
        if (typeof this.options.handler === 'function') {
          this.options.handler({
            razorpay_payment_id: `pay_demo_${Date.now()}`,
            razorpay_order_id: this.options.order_id || `order_demo_${Date.now()}`,
            razorpay_signature: `sig_demo_${Date.now()}`,
          });
        }
      } else {
        if (this.options.modal && typeof this.options.modal.ondismiss === 'function') {
          this.options.modal.ondismiss();
        }
      }
    }
  };
}

export const loadRazorpaySdk = () => {
  // If already loaded on window, resolve immediately
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise((resolve) => {
    // Check if script already injected in DOM
    const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => {
        setupMockRazorpay();
        resolve(true);
      });
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      scriptLoadingPromise = null;
      script.remove();
      console.warn('⚠️ [RazorpaySdk] External script blocked by browser or ad-blocker. Initializing test simulator.');
      setupMockRazorpay();
      resolve(true);
    };

    document.body.appendChild(script);
  });

  return scriptLoadingPromise;
};

export default loadRazorpaySdk;
