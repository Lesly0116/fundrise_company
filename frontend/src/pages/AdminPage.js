import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { Spinner, Badge, Avatar } from '../components/common/UI';
import { formatCurrency, formatDate, getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // FIX: wrap in useCallback so useEffect dependency is stable and doesn't
  // re-run on every render — fetchData was a new function reference each time
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const res = await adminAPI.getDashboard();
        setStats(res.data.data);
      } else if (activeTab === 'users') {
        const res = await adminAPI.getUsers();
        setUsers(res.data.data || []);
      } else if (activeTab === 'campaigns') {
        const res = await adminAPI.getCampaigns();
        setCampaigns(res.data.data?.content || []);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleUser = async (userId, currentEnabled) => {
    try {
      await adminAPI.toggleUserStatus(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, enabled: !u.enabled } : u));
      toast.success(`User ${currentEnabled ? 'disabled' : 'enabled'} successfully`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await adminAPI.deleteCampaign(campaignId);
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
      toast.success('Campaign deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const TABS = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'users', label: 'Users', icon: '👥' },
    { key: 'campaigns', label: 'Campaigns', icon: '📢' },
  ];

  return (
    <div className="section-container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-xl">🛡️</div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-500 text-sm">Manage users, campaigns, and platform activity</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-8">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && stats && (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'bg-blue-50 text-blue-600' },
                  { label: 'Total Campaigns', value: stats.totalCampaigns, icon: '📢', color: 'bg-green-50 text-green-600' },
                  { label: 'Total Donations', value: stats.totalDonations, icon: '❤️', color: 'bg-red-50 text-red-600' },
                  { label: 'Total Raised', value: formatCurrency(stats.totalRaised), icon: '💰', color: 'bg-yellow-50 text-yellow-600' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-2xl mb-3`}>
                      {stat.icon}
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="flex gap-3 flex-wrap">
                  <button onClick={() => setActiveTab('users')}
                    className="btn-secondary text-sm py-2 px-4">
                    Manage Users
                  </button>
                  <button onClick={() => setActiveTab('campaigns')}
                    className="btn-secondary text-sm py-2 px-4">
                    Manage Campaigns
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">All Users ({users.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['User', 'Email', 'Role', 'Campaigns', 'Donations', 'Joined', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xs flex-shrink-0">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </div>
                            <span className="font-medium text-gray-900 text-sm whitespace-nowrap">
                              {user.firstName} {user.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant={user.role === 'ADMIN' ? 'blue' : 'default'}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-center">{user.campaignCount}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-center">{user.donationCount}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(user.createdAt)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={user.enabled ? 'green' : 'red'}>
                            {user.enabled ? 'Active' : 'Disabled'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleUser(user.id, user.enabled)}
                            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                              user.enabled
                                ? 'border-red-300 text-red-600 hover:bg-red-50'
                                : 'border-green-300 text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {user.enabled ? 'Disable' : 'Enable'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900">All Campaigns ({campaigns.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Campaign', 'Organizer', 'Goal', 'Raised', 'Donors', 'Status', 'Created', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {campaigns.map(campaign => (
                      <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 max-w-[200px]">
                          <Link
                            to={`/campaigns/${campaign.id}`}
                            className="text-primary-600 hover:underline font-medium text-sm line-clamp-2"
                          >
                            {campaign.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                          {campaign.organizerName}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {formatCurrency(campaign.goalAmount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-primary-600 font-semibold whitespace-nowrap">
                          {formatCurrency(campaign.raisedAmount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-center">{campaign.donorCount}</td>
                        <td className="px-4 py-3">
                          <Badge variant={
                            campaign.status === 'ACTIVE' ? 'green' :
                            campaign.status === 'COMPLETED' ? 'blue' : 'default'
                          }>
                            {campaign.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(campaign.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Link to={`/campaigns/${campaign.id}`}
                              className="text-xs font-medium px-2 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
                              View
                            </Link>
                            <button
                              onClick={() => handleDeleteCampaign(campaign.id)}
                              className="text-xs font-medium px-2 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPage;
