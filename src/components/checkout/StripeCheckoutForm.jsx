import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/currency';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Loader2, ShieldCheck, Lock } from 'lucide-react';

export default function StripeCheckoutForm({ amount, onSucceeded, onFailed }) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          onSucceeded && onSucceeded(paymentIntent);
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-success`,
      },
      // If you want to handle the success state manually without a redirect:
      redirect: 'if_required'
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message);
      } else {
        setMessage("An unexpected error occurred.");
      }
      onFailed && onFailed(error);
    } else {
      // Payment succeeded or needs redirect (if redirect: 'if_required' was used and it didn't need redirect)
      onSucceeded && onSucceeded();
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "tabs",
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white/50 p-6 rounded-3xl border border-pink-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-charcoal-berry/60">
          <Lock size={16} className="text-blossom-pink" />
          <span className="text-xs font-bold uppercase tracking-widest">Secure Payment Details</span>
        </div>
        
        <PaymentElement id="payment-element" options={paymentElementOptions} />
        
        <div className="mt-8 flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          <div className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-green-400" />
            <span>Encrypted by Stripe</span>
          </div>
          <span>Total: {formatCurrency(amount)}</span>
        </div>
      </div>

      {message && (
        <div id="payment-message" className="p-4 rounded-2xl bg-pink-50 text-blossom-pink text-sm font-medium border border-pink-100 animate-in fade-in slide-in-from-top-2">
          {message}
        </div>
      )}

      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="w-full py-4 bg-gradient-to-r from-blossom-pink to-pink-400 text-white rounded-2xl font-bold shadow-lg shadow-pink-200 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={24} />
        ) : (
          `Pay ${formatCurrency(amount)} Now`
        )}
      </button>
    </form>
  );
}
