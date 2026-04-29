import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { campaignAPI, donationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DonationPanel from '../components/donation/DonationPanel';
import { Spinner, ProgressBar, Avatar, Badge } from '../components/common/UI';
import {
  formatCurrency, formatDate, formatRelativeDate,
  getCategoryColor, getErrorMessage
} from '../utils/helpers';
import toast from 'react-hot-toast';

const CampaignDetailPage = () => {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [donationPage, setDonationPage] = useState(0);
  const [donationTotalPages, setDonationTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState('story');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    campaignAPI.getById(id)
      .then(res => setCampaign(res.data.data))
      .catch(() => navigate('/campaigns'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (!campaign) return;
    setDonationsLoading(true);
    donationAPI.getCampaignDonations(id, donationPage, 5)
      .then(res => {
        const data = res.data.data;
        setDonations(prev => donationPage === 0 ? data.content : [...prev, ...data.content]);
        setDonationTotalPages(data.totalPages);
      })
      .catch(console.error)
      .finally(() => setDonationsLoading(false));
  }, [campaign, id, donationPage]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    setDeleting(true);
    try {
      await campaignAPI.delete(id);
      toast.success('Campaign deleted');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!campaign) return null;

  const isOwner = user?.userId === campaign.organizer?.id;
  const canEdit = isOwner || isAdmin;
  const daysLeft = campaign.endDate
    ? Math.max(0, Math.ceil((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="section-container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Campaign Image */}
          <div className="rounded-2xl overflow-hidden mb-6 bg-gray-100 aspect-video">
            {campaign.imageUrl ? (
              <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                <svg className="w-24 h-24 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            )}
          </div>

          {/* Category & Status */}
          <div className="flex items-center gap-2 mb-3">
            {campaign.category && (
              <span className={`badge ${getCategoryColor(campaign.category)}`}>{campaign.category}</span>
            )}
            {campaign.status === 'COMPLETED' && <Badge variant="green">Goal Reached 🎉</Badge>}
            {campaign.location && (
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {campaign.location}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{campaign.title}</h1>

          {/* Organizer */}
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
            <Avatar
              src={campaign.organizer?.profileImageUrl}
              name={campaign.organizer?.fullName}
              size="md"
            />
            <div>
              <p className="text-sm text-gray-500">Campaign by</p>
              <p className="font-semibold text-gray-900">{campaign.organizer?.fullName}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-gray-500">Created</p>
              <p className="text-sm font-medium text-gray-700">{formatDate(campaign.createdAt)}</p>
            </div>
          </div>

          {/* Mobile: Stats + Donation Panel */}
          <div className="lg:hidden mb-8">
            <CampaignStats campaign={campaign} daysLeft={daysLeft} />
            <div className="mt-4">
              <DonationPanel campaign={campaign} />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            {['story', 'donors'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 font-semibold text-sm capitalize transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'donors' ? `Donors (${campaign.donorCount})` : 'Campaign Story'}
              </button>
            ))}
          </div>

          {activeTab === 'story' ? (
            <div className="prose prose-gray max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base">
                {campaign.description}
              </div>
            </div>
          ) : (
            <DonorsList
              donations={donations}
              loading={donationsLoading}
              canLoadMore={donationPage < donationTotalPages - 1}
              onLoadMore={() => setDonationPage(p => p + 1)}
            />
          )}

          {/* Owner Actions */}
          {canEdit && (
            <div className="mt-8 pt-6 border-t border-gray-200 flex gap-3">
              <Link to={`/campaigns/${id}/edit`} className="btn-secondary text-sm py-2 px-4">
                Edit Campaign
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn-danger text-sm py-2 px-4"
              >
                {deleting ? 'Deleting...' : 'Delete Campaign'}
              </button>
            </div>
          )}
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <CampaignStats campaign={campaign} daysLeft={daysLeft} />
            <DonationPanel campaign={campaign} />

            {/* Share */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Share this campaign</h4>
              <div className="flex gap-2">
                {[
                  { label: 'Copy Link', icon: '🔗', action: () => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); } },
                  { label: 'Twitter', icon: '𝕏', action: () => window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=${encodeURIComponent(campaign.title)}`) },
                  { label: 'Facebook', icon: 'f', action: () => window.open(`https://facebook.com/sharer/sharer.php?u=${window.location.href}`) },
                ].map(s => (
                  <button key={s.label} onClick={s.action}
                    className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <span className="text-base font-bold">{s.icon}</span>
                    <span className="text-xs text-gray-600">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CampaignStats = ({ campaign, daysLeft }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="mb-4">
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-3xl font-bold text-gray-900">{formatCurrency(campaign.raisedAmount)}</span>
        <span className="text-gray-500">raised</span>
      </div>
      <p className="text-sm text-gray-500">of {formatCurrency(campaign.goalAmount)} goal</p>
    </div>
    <ProgressBar percentage={campaign.progressPercentage} className="mb-4" />
    <div className="grid grid-cols-3 gap-3">
      <div className="text-center">
        <p className="font-bold text-xl text-gray-900">{campaign.donorCount}</p>
        <p className="text-xs text-gray-500">donors</p>
      </div>
      <div className="text-center border-x border-gray-100">
        <p className="font-bold text-xl text-gray-900">{Math.round(campaign.progressPercentage)}%</p>
        <p className="text-xs text-gray-500">funded</p>
      </div>
      <div className="text-center">
        <p className="font-bold text-xl text-gray-900">{daysLeft ?? '∞'}</p>
        <p className="text-xs text-gray-500">{daysLeft === 0 ? 'ended' : 'days left'}</p>
      </div>
    </div>
  </div>
);

const DonorsList = ({ donations, loading, canLoadMore, onLoadMore }) => {
  if (loading && donations.length === 0) return <div className="flex justify-center py-8"><Spinner /></div>;
  if (donations.length === 0) return (
    <div className="text-center py-12 text-gray-500">
      <div className="text-4xl mb-2">❤️</div>
      <p>Be the first to donate!</p>
    </div>
  );
  return (
    <div>
      <div className="space-y-4">
        {donations.map(d => (
          <div key={d.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold flex-shrink-0">
              {d.anonymous ? '?' : (d.donorName?.[0] || '?').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900 text-sm">{d.donorName || 'Anonymous'}</p>
                <p className="font-bold text-primary-600 text-sm">{formatCurrency(d.amount)}</p>
              </div>
              {d.message && <p className="text-gray-600 text-sm mt-0.5 italic">"{d.message}"</p>}
              <p className="text-xs text-gray-400 mt-1">{formatRelativeDate(d.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
      {canLoadMore && (
        <button onClick={onLoadMore} disabled={loading}
          className="mt-4 w-full py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
          {loading ? 'Loading...' : 'Load more donors'}
        </button>
      )}
    </div>
  );
};

export default CampaignDetailPage;
