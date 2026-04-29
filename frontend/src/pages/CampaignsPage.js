import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { campaignAPI } from '../services/api';
import CampaignCard from '../components/campaign/CampaignCard';
import { Spinner, EmptyState, Pagination } from '../components/common/UI';
import { CATEGORIES } from '../utils/helpers';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'raised', label: 'Most Raised' },
  { value: 'oldest', label: 'Oldest' },
];

const CampaignsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '0');
  const sortBy = searchParams.get('sort') || 'newest';
  const [searchInput, setSearchInput] = useState(query);

  // FIX: keep the search input in sync when the URL ?q= param changes
  // externally (e.g. user clicks a category link while a search is active)
  useEffect(() => { setSearchInput(query); }, [query]);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (query) {
        res = await campaignAPI.search(query, page, 12);
      } else if (category) {
        res = await campaignAPI.getByCategory(category, page, 12);
      } else {
        res = await campaignAPI.getAll({ page, size: 12, sortBy });
      }
      const data = res.data.data;
      setCampaigns(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [query, category, page, sortBy]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParam('q', searchInput.trim());
    updateParam('category', '');
  };

  const handlePageChange = (p) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', p.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageTitle = query ? `Results for "${query}"`
    : category ? `${category} Campaigns`
    : 'All Campaigns';

  return (
    <div className="section-container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
        {totalElements > 0 && (
          <p className="text-gray-500">{totalElements.toLocaleString()} campaigns found</p>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search campaigns..."
              className="input-field pl-9 py-2.5 text-sm"
            />
          </div>
          <button type="submit" className="btn-primary py-2.5 px-4 text-sm">Search</button>
        </form>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => updateParam('sort', e.target.value)}
          className="input-field py-2.5 text-sm max-w-[180px]"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 flex-wrap mb-8">
        <button
          onClick={() => updateParam('category', '')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
            !category ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-300 text-gray-600 hover:border-gray-400'
          }`}
        >
          All
        </button>
        {CATEGORIES.filter(c => c !== 'General').map(cat => (
          <button
            key={cat}
            onClick={() => updateParam('category', cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              category === cat ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-300 text-gray-600 hover:border-gray-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : campaigns.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {campaigns.map(c => <CampaignCard key={c.id} campaign={c} />)}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      ) : (
        <EmptyState
          icon="🔍"
          title="No campaigns found"
          description={query ? `No results for "${query}". Try different keywords.` : 'No campaigns in this category yet.'}
        />
      )}
    </div>
  );
};

export default CampaignsPage;
