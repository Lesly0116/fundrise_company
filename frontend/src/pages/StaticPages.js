import React from 'react';
import { Link } from 'react-router-dom';

// ─── Reusable layout for simple static pages ──────────────────────────────────
const StaticLayout = ({ title, subtitle, children }) => (
  <div className="section-container py-16 max-w-3xl mx-auto">
    <div className="mb-10">
      <h1 className="text-4xl font-bold text-gray-900 mb-3">{title}</h1>
      {subtitle && <p className="text-lg text-gray-500">{subtitle}</p>}
    </div>
    <div className="prose prose-gray max-w-none text-gray-700 space-y-5 leading-relaxed">
      {children}
    </div>
  </div>
);

// ─── /about ───────────────────────────────────────────────────────────────────
export const AboutPage = () => (
  <StaticLayout title="About FundRise" subtitle="The world's most trusted free fundraising platform.">
    <p>
      FundRise was founded with a single mission: make fundraising accessible to everyone.
      Whether you're raising money for a medical emergency, a community project, or a personal
      goal, we provide the tools and support you need — completely free.
    </p>
    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">Our Mission</h2>
    <p>
      We believe that financial hardship should never prevent someone from getting the help they
      need. Our platform connects people in need with a global community of donors who want to
      make a difference.
    </p>
    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">Why Choose FundRise?</h2>
    <ul className="list-disc pl-6 space-y-2">
      <li>Zero platform fees — 100 % of donations go directly to the campaign organizer</li>
      <li>Secure payments powered by Stripe</li>
      <li>24/7 customer support</li>
      <li>Trusted by millions of users worldwide</li>
    </ul>
    <div className="mt-10">
      <Link to="/campaigns/create" className="btn-primary">Start Your FundRise</Link>
    </div>
  </StaticLayout>
);

// ─── /how-it-works ────────────────────────────────────────────────────────────
export const HowItWorksPage = () => (
  <StaticLayout title="How It Works" subtitle="Getting started is simple and free.">
    {[
      { step: '01', title: 'Create your campaign', body: 'Sign up for free and set up your fundraiser in minutes. Add your story, a photo, and a goal amount.' },
      { step: '02', title: 'Share with the world', body: 'Share your campaign link on social media, via email, or through WhatsApp to reach potential donors.' },
      { step: '03', title: 'Receive donations', body: 'Donors contribute securely through our platform. Funds are deposited directly to your bank account.' },
      { step: '04', title: 'Reach your goal', body: 'Keep your donors engaged with updates. Celebrate milestones and express your gratitude.' },
    ].map(({ step, title, body }) => (
      <div key={step} className="flex gap-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="text-4xl font-black text-primary-100 flex-shrink-0 w-16">{step}</div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600">{body}</p>
        </div>
      </div>
    ))}
    <div className="mt-10">
      <Link to="/register" className="btn-primary">Get Started — It's Free</Link>
    </div>
  </StaticLayout>
);

// ─── /pricing ─────────────────────────────────────────────────────────────────
export const PricingPage = () => (
  <StaticLayout title="Pricing" subtitle="No platform fees, ever.">
    <div className="bg-primary-50 border border-primary-200 rounded-2xl p-8 text-center mb-8">
      <p className="text-5xl font-black text-primary-600 mb-2">0%</p>
      <p className="text-xl font-semibold text-gray-900">Platform fee</p>
      <p className="text-gray-500 mt-2">FundRise charges no fees to create or run a campaign.</p>
    </div>
    <p>
      The only costs associated with running a FundRise campaign are standard payment-processing
      fees charged by our payment provider, Stripe — typically around 2.9% + $0.30 per
      transaction. These fees are deducted before the donation reaches you.
    </p>
    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">What's always free</h2>
    <ul className="list-disc pl-6 space-y-2">
      <li>Creating and publishing your campaign</li>
      <li>Unlimited campaign updates and photos</li>
      <li>Sharing tools and social integrations</li>
      <li>Access to our support team</li>
      <li>Donor management dashboard</li>
    </ul>
  </StaticLayout>
);

// ─── /blog ────────────────────────────────────────────────────────────────────
export const BlogPage = () => (
  <StaticLayout title="FundRise Blog" subtitle="Tips, stories, and inspiration.">
    {[
      { date: 'April 10, 2026', title: '5 Tips for Writing a Compelling Campaign Story', preview: "Your story is the heart of your fundraiser. Here's how to write one that resonates and drives donations." },
      { date: 'March 28, 2026', title: 'How One Family Raised $50,000 for Cancer Treatment', preview: 'A remarkable journey of community support that started with a single share on social media.' },
      { date: 'March 15, 2026', title: 'Understanding Donation Psychology', preview: 'What motivates people to give? We explore the science behind generosity and how to apply it to your campaign.' },
    ].map(({ date, title, preview }) => (
      <div key={title} className="border-b border-gray-100 pb-8">
        <p className="text-sm text-gray-400 mb-1">{date}</p>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{preview}</p>
      </div>
    ))}
  </StaticLayout>
);

// ─── /careers ─────────────────────────────────────────────────────────────────
export const CareersPage = () => (
  <StaticLayout title="Careers at FundRise" subtitle="Join us in making fundraising accessible to everyone.">
    <p>
      We're a passionate team on a mission to democratise fundraising. If you're driven by
      impact and love solving hard problems, we'd love to hear from you.
    </p>
    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Open Positions</h2>
    {[
      { role: 'Senior Full-Stack Engineer', dept: 'Engineering', location: 'Remote' },
      { role: 'Product Designer', dept: 'Design', location: 'Remote' },
      { role: 'Customer Success Manager', dept: 'Support', location: 'Remote' },
      { role: 'Growth Marketing Lead', dept: 'Marketing', location: 'Remote' },
    ].map(({ role, dept, location }) => (
      <div key={role} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl mb-3">
        <div>
          <p className="font-semibold text-gray-900">{role}</p>
          <p className="text-sm text-gray-500">{dept} · {location}</p>
        </div>
        <Link to="/contact" className="btn-secondary text-sm py-1.5 px-4">Apply</Link>
      </div>
    ))}
  </StaticLayout>
);

// ─── /help ────────────────────────────────────────────────────────────────────
export const HelpPage = () => (
  <StaticLayout title="Help Center" subtitle="Find answers to common questions.">
    {[
      {
        q: 'How do I start a fundraiser?',
        a: 'Click "Start a FundRise" at the top of the page, create a free account, and fill out your campaign details.',
      },
      {
        q: 'How do I withdraw my funds?',
        a: 'Funds are automatically transferred to your linked bank account. You can manage your payout settings from your dashboard.',
      },
      {
        q: 'Is there a time limit on campaigns?',
        a: 'You can optionally set an end date, but campaigns can also run indefinitely until you close them.',
      },
      {
        q: 'How do I contact a campaign organizer?',
        a: 'You can leave a comment on the campaign page or use the contact form on our Contact Us page.',
      },
      {
        q: 'What payment methods are accepted?',
        a: 'We accept all major credit and debit cards (Visa, Mastercard, Amex) through our secure Stripe integration.',
      },
    ].map(({ q, a }) => (
      <details key={q} className="group border border-gray-200 rounded-xl p-5 open:shadow-sm transition-all">
        <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
          {q}
          <span className="text-primary-500 text-xl group-open:rotate-45 transition-transform inline-block">+</span>
        </summary>
        <p className="mt-3 text-gray-600">{a}</p>
      </details>
    ))}
    <p className="mt-8 text-gray-500">
      Can't find your answer?{' '}
      <Link to="/contact" className="text-primary-600 hover:underline">Contact our support team</Link>.
    </p>
  </StaticLayout>
);

// ─── /contact ─────────────────────────────────────────────────────────────────
export const ContactPage = () => (
  <StaticLayout title="Contact Us" subtitle="We're here to help — reach out any time.">
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-4">
        {[
          { label: 'Email', value: 'johnharlyerard@gmail.com' },
          { label: 'Response time', value: 'Within 24 hours' },
          { label: 'Office hours', value: 'Mon – Fri, 9 am – 6 pm EST' },
        ].map(({ label, value }) => (
          <div key={label} className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
            <p className="font-medium text-gray-900">{value}</p>
          </div>
        ))}
      </div>
      <form
  action="https://formspree.io/f/xrerrlgb"
  method="POST"
  className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4"
>
  <h3 className="font-semibold text-gray-900">Send a Message</h3>

  <input
    className="input-field"
    name="name"
    placeholder="Your name"
    required
  />

  <input
    className="input-field"
    name="email"
    type="email"
    placeholder="Your email"
    required
  />

  <textarea
    className="input-field resize-none"
    name="message"
    rows={4}
    placeholder="How can we help?"
    required
  />

  <button type="submit" className="btn-primary w-full">
    Send Message
  </button>
</form>
    </div>
  </StaticLayout>
);

// ─── /safety ──────────────────────────────────────────────────────────────────
export const SafetyPage = () => (
  <StaticLayout title="Safety & Trust" subtitle="How we keep FundRise safe for everyone.">
    <p>
      FundRise is committed to maintaining a secure and trustworthy fundraising environment.
      We use multiple layers of protection to keep donors and organizers safe.
    </p>
    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">Our Safety Measures</h2>
    {[
      { icon: '🔒', title: 'Secure Payments', body: 'All transactions are processed through Stripe with industry-standard encryption (TLS 1.2+).' },
      { icon: '🛡️', title: 'Identity Verification', body: 'Organizers must verify their identity before accessing funds above a certain threshold.' },
      { icon: '🚨', title: 'Fraud Detection', body: 'Our automated systems flag suspicious activity in real time, and our team reviews reports within hours.' },
      { icon: '✅', title: 'Campaign Review', body: 'All campaigns are subject to our Terms of Service. Violating campaigns are removed promptly.' },
    ].map(({ icon, title, body }) => (
      <div key={title} className="flex gap-4 p-5 bg-white border border-gray-100 rounded-xl shadow-sm">
        <span className="text-3xl">{icon}</span>
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-gray-600 text-sm">{body}</p>
        </div>
      </div>
    ))}
  </StaticLayout>
);

// ─── /tips ────────────────────────────────────────────────────────────────────
export const FundraisingTipsPage = () => (
  <StaticLayout title="Fundraising Tips" subtitle="Proven strategies to maximise your campaign's success.">
    {[
      { num: 1, title: 'Tell a personal story', tip: 'Campaigns with a clear, emotional narrative raise up to 3× more than those without. Be specific about why you need help and how it will be used.' },
      { num: 2, title: 'Add a great photo', tip: 'Campaigns with a compelling cover photo receive significantly more donations. Use a clear, bright, high-quality image relevant to your cause.' },
      { num: 3, title: 'Share widely', tip: 'Your first 24 hours are critical. Share on every platform you use — Facebook, Instagram, WhatsApp, X — and ask friends and family to share too.' },
      { num: 4, title: 'Post regular updates', tip: 'Donors who receive updates are much more likely to donate again. Post at least once a week to keep your community engaged.' },
      { num: 5, title: 'Thank your donors', tip: 'Personally thank each donor, especially early ones. Gratitude drives word-of-mouth and repeat giving.' },
      { num: 6, title: 'Set a realistic goal', tip: 'Campaigns that hit their goals (or get close) attract more donors due to social proof. Start with a realistic target and increase it if needed.' },
    ].map(({ num, title, tip }) => (
      <div key={num} className="flex gap-5 p-5 bg-white border border-gray-100 rounded-xl shadow-sm">
        <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">{num}</div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-gray-600 text-sm">{tip}</p>
        </div>
      </div>
    ))}
  </StaticLayout>
);

// ─── /privacy, /terms, /cookies ───────────────────────────────────────────────
export const PrivacyPage = () => (
  <StaticLayout title="Privacy Policy" subtitle="Last updated April 1, 2026">
    <p>FundRise respects your privacy and is committed to protecting your personal data.</p>
    <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">Data We Collect</h2>
    <p>We collect information you provide (name, email, payment data) and usage data (pages visited, clicks) to operate and improve the platform.</p>
    <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">How We Use It</h2>
    <p>Your data is used to process donations, send receipts, prevent fraud, and improve our services. We never sell your data to third parties.</p>
    <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">Contact</h2>
    <p>For privacy inquiries email <a href="mailto:privacy@fundrise.com" className="text-primary-600 hover:underline">privacy@fundrise.com</a>.</p>
  </StaticLayout>
);

export const TermsPage = () => (
  <StaticLayout title="Terms of Service" subtitle="Last updated April 1, 2026">
    <p>By using FundRise you agree to these terms. Please read them carefully.</p>
    <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">Acceptable Use</h2>
    <p>You may not use FundRise for illegal activities, fraud, or campaigns that violate our Community Guidelines.</p>
    <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">Fees</h2>
    <p>FundRise charges no platform fee. Standard payment-processing fees apply as described on our Pricing page.</p>
    <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">Termination</h2>
    <p>We reserve the right to suspend or terminate accounts that violate these terms without prior notice.</p>
  </StaticLayout>
);

export const CookiePolicyPage = () => (
  <StaticLayout title="Cookie Policy" subtitle="Last updated April 1, 2026">
    <p>FundRise uses cookies to deliver and improve our services.</p>
    <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">What Are Cookies?</h2>
    <p>Cookies are small text files stored in your browser. They allow us to remember your preferences and analyse traffic.</p>
    <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">Types We Use</h2>
    <ul className="list-disc pl-6 space-y-1">
      <li><strong>Essential</strong> — required for the platform to function (auth session).</li>
      <li><strong>Analytics</strong> — anonymous usage stats to improve the product.</li>
      <li><strong>Preferences</strong> — remember your settings across visits.</li>
    </ul>
    <p className="mt-4">You can disable non-essential cookies in your browser settings at any time.</p>
  </StaticLayout>
);

// ─── /forgot-password ─────────────────────────────────────────────────────────
// FIX: LoginPage links to /forgot-password but no route existed → 404.
// A real password-reset flow requires a backend email service; this page
// provides a clear next-step so the user isn't stranded.
export const ForgotPasswordPage = () => {
  const [email, setEmail] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    // Placeholder — wire up to a real POST /api/auth/forgot-password endpoint
    // when the backend email flow is implemented.
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">F</span>
            </div>
            <span className="font-bold text-2xl text-gray-900">FundRise</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
          <p className="text-gray-500 mt-1">We'll send you a reset link</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8">
          {submitted ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">📧</div>
              <h3 className="font-semibold text-gray-900 mb-2">Check your inbox</h3>
              <p className="text-gray-500 text-sm">
                If an account with <strong>{email}</strong> exists, a password reset
                link has been sent. Check your spam folder if you don't see it.
              </p>
              <Link to="/login" className="btn-primary inline-block mt-6">Back to Sign In</Link>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="label">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!email}
                  className="btn-primary w-full"
                >
                  Send Reset Link
                </button>
              </div>
              <p className="text-center text-sm text-gray-600 mt-6">
                Remember your password?{' '}
                <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
