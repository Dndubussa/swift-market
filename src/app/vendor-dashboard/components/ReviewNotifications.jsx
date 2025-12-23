'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function ReviewNotifications({ reviews }) {
  const [expandedReview, setExpandedReview] = useState(null);

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-success';
    if (rating >= 3) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="ChatBubbleLeftRightIcon" size={24} className="text-primary" />
            <h2 className="text-xl font-heading font-bold text-foreground">Customer Reviews</h2>
          </div>
          <span className="px-2 py-1 bg-accent text-accent-foreground rounded-full text-xs font-semibold">
            {reviews?.filter((r) => !r?.responded)?.length} Pending
          </span>
        </div>
      </div>
      <div className="divide-y divide-border max-h-96 overflow-y-auto">
        {reviews?.map((review) => (
          <div key={review?.id} className="p-4 hover:bg-muted/30 transition-colors duration-200">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-semibold">
                    {review?.customerName?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{review?.customerName}</p>
                  <p className="text-xs text-muted-foreground">{review?.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)]?.map((_, i) => (
                  <Icon
                    key={i}
                    name="StarIcon"
                    size={14}
                    variant={i < review?.rating ? 'solid' : 'outline'}
                    className={i < review?.rating ? getRatingColor(review?.rating) : 'text-muted-foreground'}
                  />
                ))}
              </div>
            </div>

            <p className="text-sm text-foreground mb-2">{review?.productName}</p>
            <p className="text-sm text-muted-foreground mb-3">
              {expandedReview === review?.id ? review?.comment : `${review?.comment?.substring(0, 100)}...`}
            </p>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setExpandedReview(expandedReview === review?.id ? null : review?.id)}
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors duration-200"
              >
                {expandedReview === review?.id ? 'Show Less' : 'Read More'}
              </button>
              {!review?.responded && (
                <button className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors duration-200">
                  Respond
                </button>
              )}
              {review?.responded && (
                <span className="flex items-center space-x-1 text-xs text-success">
                  <Icon name="CheckCircleIcon" size={14} />
                  <span>Responded</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

ReviewNotifications.propTypes = {
  reviews: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.string?.isRequired,
      customerName: PropTypes?.string?.isRequired,
      productName: PropTypes?.string?.isRequired,
      rating: PropTypes?.number?.isRequired,
      comment: PropTypes?.string?.isRequired,
      date: PropTypes?.string?.isRequired,
      responded: PropTypes?.bool?.isRequired,
    })
  )?.isRequired,
};