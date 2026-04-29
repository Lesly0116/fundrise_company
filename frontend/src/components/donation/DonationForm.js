import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { formatCurrency, getErrorMessage } from '../../utils/helpers';
import { Spinner } from '../common/UI';
import toast from 'react-hot-toast';

const PRESET_AMOUNTS = [10, 25, 50, 100, 250];

const DonationForm = ({ campaign, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: amount, 2: payment

  const effectiveAmount = isCustom ? parseFloat(customAmount) || 0 : amount;

  const handleAmountSelect = (val) => {
    setAmount(val);
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setCustomAmount(val);
    setIsCustom(true);
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (effectiveAmount < 1) {
      toast.error('Minimum donation is $1');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/donation-success`,
          payment_method_data: {
            billing_details: {
              name: anonymous ? 'Anonymous' : donorName,
              email: donorEmail,
            },
          },
        },
      });

      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          toast.error(error.message);
        } else {
          toast.error('Payment failed. Please try again.');
        }
      } else {
        // Will redirect to return_url on success
        onSuccess?.();
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      {step === 1 ? (
        <form onSubmit={handleContinue}>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Make a Donation</h3>

          {/* Preset Amounts */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {PRESET_AMOUNTS.map(val => (
              <button
                key={val}
                type="button"
                onClick={() => handleAmountSelect(val)}
                className={`py-2.5 px-3 rounded-lg border-2 font-semibold text-sm transition-all ${
                  !isCustom && amount === val
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                ${val}
              </button>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="mb-4">
            <div className={`flex items-center border-2 rounded-lg transition-all ${
              isCustom ? 'border-primary-500' : 'border-gray-200'
            }`}>
              <span className="pl-3 text-gray-500 font-medium">$</span>
              <input
                type="text"
                placeholder="Other amount"
                value={customAmount}
                onChange={handleCustomAmountChange}
                onFocus={() => setIsCustom(true)}
                className="flex-1 py-2.5 px-2 outline-none rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Message */}
          <div className="mb-4">
            <label className="label">Add a message (optional)</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Words of encouragement..."
              rows={3}
              maxLength={300}
              className="input-field resize-none text-sm"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{message.length}/300</p>
          </div>

          {/* Donor info */}
          <div className="mb-4">
            <label className="label">Your name</label>
            <input
              type="text"
              value={donorName}
              onChange={e => setDonorName(e.target.value)}
              placeholder="Enter your name"
              className="input-field text-sm"
              disabled={anonymous}
            />
          </div>
          <div className="mb-4">
            <label className="label">Email address</label>
            <input
              type="email"
              value={donorEmail}
              onChange={e => setDonorEmail(e.target.value)}
              placeholder="you@email.com"
              className="input-field text-sm"
            />
          </div>

          {/* Anonymous toggle */}
          <label className="flex items-center gap-3 mb-5 cursor-pointer">
            <div
              onClick={() => setAnonymous(!anonymous)}
              className={`relative w-10 h-5 rounded-full transition-colors ${anonymous ? 'bg-primary-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${anonymous ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-gray-700">Donate anonymously</span>
          </label>

          <button
            type="submit"
            className="btn-primary w-full text-center"
            disabled={effectiveAmount < 1}
          >
            Continue — {formatCurrency(effectiveAmount)}
          </button>

          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Secured by Stripe · SSL encrypted
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-3 mb-5">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Payment Details</h3>
              <p className="text-sm text-primary-600 font-semibold">{formatCurrency(effectiveAmount)}</p>
            </div>
          </div>

          <PaymentElement className="mb-4" />

          <button
            type="submit"
            disabled={!stripe || processing}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
          >
            {processing ? (
              <>
                <Spinner size="sm" />
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Donate {formatCurrency(effectiveAmount)}
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Secured by Stripe
          </div>
        </form>
      )}
    </div>
  );
};

export default DonationForm;
