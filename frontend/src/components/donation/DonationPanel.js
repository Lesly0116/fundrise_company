import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { donationAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DonationForm from './DonationForm';
import { Spinner } from '../common/UI';
import { getErrorMessage } from '../../utils/helpers';

// FIX: guard against placeholder key — loadStripe with a non-pk_live/pk_test key
// returns null and causes silent failures in the payment form. When unconfigured we
// render a friendly "unavailable" message instead of a broken Stripe element.
const STRIPE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '';
const stripeConfigured = STRIPE_KEY.startsWith('pk_test_') || STRIPE_KEY.startsWith('pk_live_');
const stripePromise = stripeConfigured ? loadStripe(STRIPE_KEY) : null;

const PRESET_AMOUNTS = [10, 25, 50, 100, 250];

const DonationPanel = ({ campaign }) => {
  const { isAuthenticated } = useAuth();
  const [clientSecret, setClientSecret] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const effectiveAmount = isCustom ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleGetStarted = async (e) => {
    e.preventDefault();
    if (effectiveAmount < 1) { setError('Minimum donation is $1'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await donationAPI.createPaymentIntent({
        campaignId: campaign.id,
        amount: effectiveAmount,
        message,
        anonymous,
        donorName: anonymous ? 'Anonymous' : donorName,
        donorEmail,
      });
      setClientSecret(res.data.data.clientSecret);
      setShowForm(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const stripeOptions = clientSecret ? {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: { colorPrimary: '#02a95c', borderRadius: '8px' },
    },
  } : null;

  if (!stripeConfigured) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
        <div className="text-3xl mb-2">⚙️</div>
        <h3 className="font-bold text-yellow-800 text-sm">Payments not configured</h3>
        <p className="text-yellow-700 text-xs mt-1">
          Set <code>REACT_APP_STRIPE_PUBLISHABLE_KEY</code> to enable donations.
        </p>
      </div>
    );
  }

  if (campaign.status === 'COMPLETED') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="text-4xl mb-2">🎉</div>
        <h3 className="font-bold text-green-800 text-lg">Goal Reached!</h3>
        <p className="text-green-600 text-sm mt-1">This campaign has reached its fundraising goal.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
      {showForm && clientSecret ? (
        <Elements stripe={stripePromise} options={stripeOptions}>
          <DonationForm
            campaign={campaign}
            onSuccess={() => { setShowForm(false); setClientSecret(null); }}
          />
        </Elements>
      ) : (
        <form onSubmit={handleGetStarted}>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Make a Donation</h3>

          {/* Preset amounts */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {PRESET_AMOUNTS.map(val => (
              <button
                key={val} type="button"
                onClick={() => { setSelectedAmount(val); setIsCustom(false); setCustomAmount(''); }}
                className={`py-2.5 rounded-lg border-2 font-semibold text-sm transition-all ${
                  !isCustom && selectedAmount === val
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                ${val}
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className={`flex items-center border-2 rounded-lg mb-4 transition-all ${isCustom ? 'border-primary-500' : 'border-gray-200'}`}>
            <span className="pl-3 text-gray-500 font-medium">$</span>
            <input
              type="text" placeholder="Other amount"
              value={customAmount}
              onChange={e => { setCustomAmount(e.target.value.replace(/[^0-9.]/g, '')); setIsCustom(true); }}
              onFocus={() => setIsCustom(true)}
              className="flex-1 py-2.5 px-2 outline-none text-sm"
            />
          </div>

          {/* Optional message */}
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Add a message of support... (optional)"
            rows={2}
            className="input-field text-sm mb-3 resize-none"
          />

          {/* Donor name & email */}
          <input type="text" placeholder="Your name" value={donorName}
            onChange={e => setDonorName(e.target.value)}
            className="input-field text-sm mb-3" disabled={anonymous} />
          <input type="email" placeholder="Email address" value={donorEmail}
            onChange={e => setDonorEmail(e.target.value)}
            className="input-field text-sm mb-3" />

          {/* Anonymous */}
          <label className="flex items-center gap-3 mb-4 cursor-pointer">
            <div onClick={() => setAnonymous(!anonymous)}
              className={`relative w-10 h-5 rounded-full transition-colors ${anonymous ? 'bg-primary-500' : 'bg-gray-300'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${anonymous ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-gray-700">Donate anonymously</span>
          </label>

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          <button type="submit" disabled={loading || effectiveAmount < 1} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><Spinner size="sm" />Processing...</> : `Donate $${effectiveAmount || '—'}`}
          </button>

          <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-gray-500">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Secured by Stripe · No fees
          </div>
        </form>
      )}
    </div>
  );
};

export default DonationPanel;
