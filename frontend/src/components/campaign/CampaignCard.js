import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatCurrency, getCategoryColor, formatRelativeDate } from '../../utils/helpers';
import { ProgressBar } from '../common/UI';

const CampaignCard = ({ campaign }) => {
  const { t } = useTranslation();
  const {
    id, title, imageUrl, raisedAmount, goalAmount, donorCount,
    progressPercentage, category, organizerName, location,
  } = campaign;

  return (
    <Link to={`/campaigns/${id}`} className="card block group">
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
            <svg className="w-16 h-16 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        )}
        {category && (
          <span className={`absolute top-3 left-3 badge text-xs font-medium ${getCategoryColor(category)}`}>
            {t(`categories.${category}`, category)}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>

        <ProgressBar percentage={progressPercentage} className="mb-3" />

        {/* Stats */}
        <div className="mb-3">
          <div className="flex items-baseline gap-1 mb-0.5">
            <span className="font-bold text-gray-900 text-lg">{formatCurrency(raisedAmount)}</span>
            <span className="text-gray-500 text-sm">{t('common.raised')}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>of {formatCurrency(goalAmount)} {t('common.goal')}</span>
            <span>
              {donorCount} {donorCount === 1 ? t('common.donor') : t('common.donors')}
            </span>
          </div>
        </div>

        {/* Organizer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-semibold">
              {organizerName?.[0]?.toUpperCase() || '?'}
            </div>
            <span className="text-xs text-gray-600 truncate max-w-[120px]">{organizerName}</span>
          </div>
          {location && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate max-w-[80px]">{location}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CampaignCard;
