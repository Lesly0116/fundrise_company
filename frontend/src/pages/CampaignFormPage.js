import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { campaignAPI } from '../services/api';
import { CATEGORIES, getErrorMessage } from '../utils/helpers';
import { Spinner, ErrorMessage } from '../components/common/UI';
import toast from 'react-hot-toast';

const CampaignForm = ({ mode = 'create' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(mode === 'edit');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [form, setForm] = useState({
    title: '', description: '', goalAmount: '',
    category: 'General', location: '', endDate: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === 'edit' && id) {
      campaignAPI.getById(id)
        .then(res => {
          const c = res.data.data;
          setForm({
            title: c.title || '',
            description: c.description || '',
            goalAmount: c.goalAmount?.toString() || '',
            category: c.category || 'General',
            location: c.location || '',
            endDate: c.endDate ? c.endDate.split('T')[0] : '',
          });
          if (c.imageUrl) setImagePreview(c.imageUrl);
        })
        .catch(() => { toast.error('Failed to load campaign'); navigate('/dashboard'); })
        .finally(() => setFetchLoading(false));
    }
  }, [mode, id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be under 10MB'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim() || form.title.length < 5) errs.title = 'Title must be at least 5 characters';
    if (!form.description.trim() || form.description.length < 20) errs.description = 'Description must be at least 20 characters';
    if (!form.goalAmount || isNaN(form.goalAmount) || parseFloat(form.goalAmount) < 1)
      errs.goalAmount = 'Goal amount must be at least $1';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const campaignData = {
        title: form.title.trim(),
        description: form.description.trim(),
        goalAmount: parseFloat(form.goalAmount),
        category: form.category,
        location: form.location.trim() || null,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      };

      const formData = new FormData();
      formData.append('campaign', new Blob([JSON.stringify(campaignData)], { type: 'application/json' }));
      if (imageFile) formData.append('image', imageFile);

      if (mode === 'create') {
        const res = await campaignAPI.create(formData);
        toast.success('Campaign created successfully!');
        navigate(`/campaigns/${res.data.data.id}`);
      } else {
        const res = await campaignAPI.update(id, formData);
        toast.success('Campaign updated!');
        navigate(`/campaigns/${res.data.data.id}`);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="section-container py-10 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {mode === 'create' ? 'Start a FundRise' : 'Edit Campaign'}
        </h1>
        <p className="text-gray-500 mt-2">
          {mode === 'create' ? 'Tell your story and start raising funds.' : 'Update your campaign details.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div>
          <label className="label">Campaign Photo</label>
          <div
            onClick={() => fileRef.current.click()}
            className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-colors overflow-hidden ${
              imagePreview ? 'border-primary-300' : 'border-gray-300 hover:border-primary-400'
            }`}
          >
            {imagePreview ? (
              <div className="relative aspect-video">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white font-medium">Change Photo</span>
                </div>
              </div>
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-primary-500 transition-colors">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="text-center">
                  <p className="font-medium">Click to upload a photo</p>
                  <p className="text-sm">JPG, PNG, WebP up to 10MB</p>
                </div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </div>

        {/* Title */}
        <div>
          <label className="label">Campaign Title *</label>
          <input
            name="title" value={form.title} onChange={handleChange}
            placeholder="A clear, compelling title for your campaign"
            className={`input-field ${errors.title ? 'input-error' : ''}`}
            maxLength={200}
          />
          <div className="flex justify-between mt-1">
            <ErrorMessage message={errors.title} />
            <span className="text-xs text-gray-400">{form.title.length}/200</span>
          </div>
        </div>

        {/* Goal Amount */}
        <div>
          <label className="label">Fundraising Goal *</label>
          <div className={`flex items-center border rounded-lg overflow-hidden transition-all ${
            errors.goalAmount ? 'border-red-400' : 'border-gray-300 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500'
          }`}>
            <span className="px-3 py-3 bg-gray-50 border-r border-gray-300 text-gray-600 font-medium">$</span>
            <input
              type="number" name="goalAmount" value={form.goalAmount} onChange={handleChange}
              placeholder="5,000"
              min="1" step="1"
              className="flex-1 px-3 py-3 outline-none text-gray-900"
            />
            <span className="px-3 py-3 text-gray-500 text-sm">USD</span>
          </div>
          <ErrorMessage message={errors.goalAmount} />
        </div>

        {/* Category & Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select name="category" value={form.category} onChange={handleChange} className="input-field">
              {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Location (optional)</label>
            <input name="location" value={form.location} onChange={handleChange}
              placeholder="City, State" className="input-field" />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="label">End Date (optional)</label>
          <input type="date" name="endDate" value={form.endDate} onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="input-field" />
        </div>

        {/* Description */}
        <div>
          <label className="label">Campaign Story *</label>
          <textarea
            name="description" value={form.description} onChange={handleChange}
            placeholder="Tell your story. Why are you raising money? How will the funds be used? Be specific and personal."
            rows={10}
            className={`input-field resize-y ${errors.description ? 'input-error' : ''}`}
          />
          <div className="flex justify-between mt-1">
            <ErrorMessage message={errors.description} />
            <span className="text-xs text-gray-400">{form.description.length} chars</span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary flex-1"
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? (
              <><Spinner size="sm" />{mode === 'create' ? 'Creating...' : 'Saving...'}</>
            ) : (
              mode === 'create' ? 'Launch Campaign' : 'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export const CreateCampaignPage = () => <CampaignForm mode="create" />;
export const EditCampaignPage = () => <CampaignForm mode="edit" />;
export default CampaignForm;
