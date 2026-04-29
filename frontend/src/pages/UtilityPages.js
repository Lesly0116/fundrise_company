import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export const DonationSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(10);
  const paymentIntent = searchParams.get('payment_intent');

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) window.location.href = '/campaigns';
  }, [countdown]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full text-center">
        {/* Animated checkmark */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-green-300 animate-ping opacity-25" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">Thank you for your donation! 🎉</h1>
        <p className="text-gray-600 mb-2">Your payment was processed successfully.</p>
        {paymentIntent && (
          <p className="text-xs text-gray-400 mb-8 font-mono">Ref: {paymentIntent.slice(-12)}</p>
        )}

        <div className="bg-white rounded-2xl shadow-card p-6 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
          <div className="space-y-3">
            {[
              { icon: '📧', text: "A confirmation receipt will be sent to your email." },
              { icon: '💳', text: "The donation will appear on your bank statement within 1–3 business days." },
              { icon: '🤝', text: "The campaign organizer will be notified and the funds will go towards their goal." },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <p className="text-sm text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/campaigns" className="btn-primary">
            Explore More Campaigns
          </Link>
          <Link to="/dashboard" className="btn-secondary">
            Go to Dashboard
          </Link>
        </div>

        <p className="text-sm text-gray-400 mt-6">
          Redirecting to campaigns in {countdown}s...
        </p>
      </div>
    </div>
  );
};

export const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="text-center max-w-md">
      <div className="text-8xl font-black text-gray-200 mb-4">404</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Page not found</h1>
      <p className="text-gray-500 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3 justify-center">
        <Link to="/" className="btn-primary">Go Home</Link>
        <Link to="/campaigns" className="btn-secondary">Browse Campaigns</Link>
      </div>
    </div>
  </div>
);
