'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { reviewService } from '@/lib/services/disputeService';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import PropTypes from 'prop-types';

export default function ReviewsSection({ productId, averageRating, totalReviews }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [vendorResponseText, setVendorResponseText] = useState({});

  const isVendor = user?.role === 'vendor';

  useEffect(() => {
    if (productId) {
      loadReviews();
    }
  }, [productId]);

  const loadReviews = async () => {
    if (!productId) {
      console.warn('No productId provided to ReviewsSection');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await reviewService?.getProductReviews(productId);
      if (error) throw error;
      
      const processedReviews = data?.map(review => ({
        ...review,
        helpfulCount: review?.votes?.filter(v => v?.vote_type === 'helpful')?.length || 0,
        unhelpfulCount: review?.votes?.filter(v => v?.vote_type === 'unhelpful')?.length || 0,
        userVote: review?.votes?.find(v => v?.user_id === user?.id)?.vote_type || null
      }));
      
      setReviews(processedReviews || []);
    } catch (err) {
      console.error('Failed to load reviews:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (reviewId, voteType) => {
    if (!user?.id) return;
    
    try {
      await reviewService?.voteOnReview(reviewId, user?.id, voteType);
      await loadReviews();
    } catch (err) {
      console.error('Failed to vote:', err?.message);
    }
  };

  const handleVendorResponse = async (reviewId) => {
    const response = vendorResponseText?.[reviewId];
    if (!response?.trim()) return;
    
    try {
      await reviewService?.respondToReview(reviewId, response);
      setVendorResponseText({ ...vendorResponseText, [reviewId]: '' });
      await loadReviews();
    } catch (err) {
      console.error('Failed to respond:', err?.message);
    }
  };

  const ratingDistribution = [5, 4, 3, 2, 1]?.map(stars => {
    const count = reviews?.filter(r => r?.rating === stars)?.length || 0;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { stars, count, percentage };
  });

  const filteredReviews =
    filterRating === 'all'
      ? reviews
      : reviews?.filter((review) => review?.rating === parseInt(filterRating));

  const sortedReviews = [...filteredReviews]?.sort((a, b) => {
    if (sortBy === 'recent') return new Date(b?.created_at) - new Date(a?.created_at);
    if (sortBy === 'helpful') return (b?.helpfulCount || 0) - (a?.helpfulCount || 0);
    if (sortBy === 'highest') return b?.rating - a?.rating;
    if (sortBy === 'lowest') return a?.rating - b?.rating;
    return 0;
  });

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6 shadow-card">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-card">
      <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
        Customer Reviews
      </h2>
      {/* Rating Overview */}
      <div className="grid md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-border">
        <div className="flex flex-col items-center justify-center">
          <div className="text-5xl font-bold text-foreground mb-2">
            {averageRating?.toFixed(1)}
          </div>
          <div className="flex items-center space-x-1 mb-2">
            {[1, 2, 3, 4, 5]?.map((star) => (
              <Icon
                key={star}
                name="StarIcon"
                size={24}
                className={`${
                  star <= Math.round(averageRating)
                    ? 'text-accent fill-accent' :'text-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Based on {totalReviews} reviews</p>
        </div>

        <div className="space-y-2">
          {ratingDistribution?.map((dist) => (
            <div key={dist?.stars} className="flex items-center space-x-3">
              <button
                onClick={() => setFilterRating(dist?.stars?.toString())}
                className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <span>{dist?.stars}</span>
                <Icon name="StarIcon" size={14} className="text-accent fill-accent" />
              </button>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${dist?.percentage}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-12 text-right">
                {dist?.count}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Filter and Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilterRating('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              filterRating === 'all' ?'bg-primary text-primary-foreground' :'bg-muted text-foreground hover:bg-muted-foreground/10'
            }`}
          >
            All Reviews
          </button>
          {[5, 4, 3, 2, 1]?.map((rating) => (
            <button
              key={rating}
              onClick={() => setFilterRating(rating?.toString())}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                filterRating === rating?.toString()
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted-foreground/10'
              }`}
            >
              {rating} <Icon name="StarIcon" size={14} className="inline ml-1" />
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e?.target?.value)}
          className="px-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="recent">Most Recent</option>
          <option value="helpful">Most Helpful</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
      </div>
      {/* Reviews List */}
      <div className="space-y-6">
        {sortedReviews?.map((review) => (
          <div key={review?.id} className="pb-6 border-b border-border last:border-0">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <AppImage
                  src={review?.user?.avatar_url || '/images/no_image.png'}
                  alt={`${review?.user?.full_name || 'User'} avatar`}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      {review?.user?.full_name || 'Anonymous'}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5]?.map((star) => (
                          <Icon
                            key={star}
                            name="StarIcon"
                            size={14}
                            className={`${
                              star <= review?.rating
                                ? 'text-accent fill-accent' :'text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      {review?.is_verified_purchase && (
                        <span className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full font-medium flex items-center space-x-1">
                          <Icon name="CheckBadgeIcon" size={12} />
                          <span>Verified Purchase</span>
                        </span>
                      )}
                      {review?.admin_verified && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium flex items-center space-x-1">
                          <Icon name="ShieldCheckIcon" size={12} />
                          <span>Admin Verified</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review?.created_at)?.toLocaleDateString()}
                  </span>
                </div>

                <p className="text-sm text-foreground leading-relaxed mb-3">{review?.comment}</p>

                {review?.images && review?.images?.length > 0 && (
                  <div className="flex space-x-2 mb-3">
                    {review?.images?.map((image, index) => (
                      <div
                        key={index}
                        className="w-20 h-20 rounded-md overflow-hidden border border-border"
                      >
                        <AppImage
                          src={image?.url || '/images/no_image.png'}
                          alt={image?.alt || 'Review image'}
                          width={80}
                          height={80}
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center space-x-4 text-sm mb-3">
                  <button
                    onClick={() => handleVote(review?.id, 'helpful')}
                    disabled={!user?.id}
                    className={`flex items-center space-x-1 transition-colors duration-200 ${
                      review?.userVote === 'helpful' ?'text-primary font-semibold' :'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon name="HandThumbUpIcon" size={16} />
                    <span>Helpful ({review?.helpfulCount || 0})</span>
                  </button>
                  <button
                    onClick={() => handleVote(review?.id, 'unhelpful')}
                    disabled={!user?.id}
                    className={`flex items-center space-x-1 transition-colors duration-200 ${
                      review?.userVote === 'unhelpful' ?'text-destructive font-semibold' :'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon name="HandThumbDownIcon" size={16} />
                    <span>Not Helpful ({review?.unhelpfulCount || 0})</span>
                  </button>
                </div>

                {/* Vendor Response Display */}
                {review?.vendor_response && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-2 mb-2">
                      <Icon name="BuildingStorefrontIcon" size={16} className="text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-primary mb-1">Seller Response</p>
                        <p className="text-sm text-foreground">{review?.vendor_response}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(review?.vendor_responded_at)?.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Vendor Response Form */}
                {isVendor && !review?.vendor_response && (
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border">
                    <textarea
                      value={vendorResponseText?.[review?.id] || ''}
                      onChange={(e) => setVendorResponseText({
                        ...vendorResponseText,
                        [review?.id]: e?.target?.value
                      })}
                      placeholder="Respond to this review..."
                      className="w-full px-3 py-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-ring mb-2"
                      rows={3}
                    />
                    <button
                      onClick={() => handleVendorResponse(review?.id)}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
                    >
                      Submit Response
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

ReviewsSection.propTypes = {
  productId: PropTypes?.string?.isRequired,
  averageRating: PropTypes?.number?.isRequired,
  totalReviews: PropTypes?.number?.isRequired,
};