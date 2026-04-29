import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { campaignAPI, donationAPI, userAPI } from '../services/api';
import CampaignCard from '../components/campaign/CampaignCard';
import { Spinner, EmptyState, Pagination, Avatar } from '../components/common/UI';
import { formatCurrency, formatDate, getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

export const DashboardPage = ({ initialTab = 'campaigns' }) => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  // FIX: initialTab prop was being passed from /my-donations route but ignored
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [camRes, donRes] = await Promise.all([
          campaignAPI.getMyCampaigns(page, 6),
          donationAPI.getMyDonations(),
        ]);
        const camData = camRes.data.data;
        setCampaigns(camData.content || []);
        setTotalPages(camData.totalPages || 0);
        setDonations(donRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page]);

  const totalRaised = campaigns.reduce((sum, c) => sum + (c.raisedAmount || 0), 0);
  const totalDonated = donations.reduce((sum, d) => sum + (d.amount || 0), 0);

  return (
    <div className="section-container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's an overview of your fundraising activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Campaigns Created', value: campaigns.length, icon: '📢' },
          { label: 'Total Raised', value: formatCurrency(totalRaised), icon: '💰' },
          { label: 'Donations Made', value: donations.length, icon: '❤️' },
          { label: 'Total Donated', value: formatCurrency(totalDonated), icon: '🌟' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
            </div>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-8">
        <Link to="/campaigns/create" className="btn-primary text-sm py-2.5 px-5">
          + Start New Campaign
        </Link>
        <Link to="/campaigns" className="btn-secondary text-sm py-2.5 px-5">
          Browse Campaigns
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { key: 'campaigns', label: `My Campaigns (${campaigns.length})` },
          { key: 'donations', label: `My Donations (${donations.length})` },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 font-semibold text-sm transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : activeTab === 'campaigns' ? (
        campaigns.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map(c => <CampaignCard key={c.id} campaign={c} />)}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        ) : (
          <EmptyState icon="📢" title="No campaigns yet"
            description="Start your first fundraiser and begin raising money for what matters."
            action={<Link to="/campaigns/create" className="btn-primary inline-block">Start a Campaign</Link>}
          />
        )
      ) : (
        donations.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Campaign', 'Amount', 'Date', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {donations.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/campaigns/${d.campaignId}`} className="text-primary-600 hover:underline font-medium text-sm">
                        {d.campaignTitle}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(d.amount)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(d.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${d.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon="❤️" title="No donations yet"
            description="Support causes you care about and make a difference."
            action={<Link to="/campaigns" className="btn-primary inline-block">Browse Campaigns</Link>}
          />
        )
      )}
    </div>
  );
};

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const fileRef = React.useRef();
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', bio: user?.bio || '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profileImageUrl || null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('profile', new Blob([JSON.stringify(form)], { type: 'application/json' }));
      if (imageFile) formData.append('image', imageFile);
      const res = await userAPI.updateProfile(formData);
      updateUser(res.data.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-container py-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="bg-white rounded-2xl shadow-card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar src={imagePreview} name={`${form.firstName} ${form.lastName}`} size="xl" />
              <button type="button" onClick={() => fileRef.current.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center text-white hover:bg-primary-600 transition-colors shadow">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>
            <div>
              <p className="font-bold text-lg text-gray-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <p className="text-xs text-gray-400 mt-1">Member since {formatDate(user?.createdAt)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First name</label>
              <input type="text" name="firstName" value={form.firstName} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="label">Last name</label>
              <input type="text" name="lastName" value={form.lastName} onChange={handleChange} className="input-field" />
            </div>
          </div>

          <div>
            <label className="label">Email address</label>
            <input type="email" value={user?.email} disabled className="input-field bg-gray-50 text-gray-500 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="label">Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange}
              placeholder="Tell others a bit about yourself..."
              rows={4} maxLength={500}
              className="input-field resize-none" />
            <p className="text-xs text-gray-400 text-right mt-1">{form.bio.length}/500</p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <><Spinner size="sm" />Saving...</> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};
