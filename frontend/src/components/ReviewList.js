import React, { useState } from 'react';
import api from '../services/api';

export default function ReviewList({ reviews, productId, onReviewsUpdate }) {
  const [sortBy, setSortBy] = useState('recent');
  const [expandedReviews, setExpandedReviews] = useState(new Set());

  const handleMarkHelpful = async (reviewId) => {
    try {
      await api.put(`/products/${productId}/reviews/${reviewId}/helpful`);
      if (onReviewsUpdate) {
        onReviewsUpdate();
      }
    } catch (err) {
      console.error('Failed to mark review as helpful:', err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await api.delete(`/products/${productId}/reviews/${reviewId}`);
      alert('Review deleted successfully');
      if (onReviewsUpdate) {
        onReviewsUpdate();
      }
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  const toggleExpanded = (reviewId) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const renderStars = (rating) => {
    return (
      <div className="d-inline-flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`bi bi-star${star <= rating ? '-fill' : ''}`}
            style={{ color: star <= rating ? '#ffc107' : '#dee2e6' }}
          ></i>
        ))}
      </div>
    );
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-chat-square-text text-muted" style={{ fontSize: '3rem' }}></i>
        <p className="text-muted mt-3">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Sort Options */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">Customer Reviews ({reviews.length})</h5>
        <select
          className="form-select"
          style={{ width: 'auto' }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="recent">Most Recent</option>
          <option value="helpful">Most Helpful</option>
          <option value="rating-high">Highest Rating</option>
          <option value="rating-low">Lowest Rating</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="list-group list-group-flush">
        {reviews.map((review) => {
          const isExpanded = expandedReviews.has(review._id);
          const commentLength = review.comment?.length || 0;
          const shouldTruncate = commentLength > 300;

          return (
            <div key={review._id} className="list-group-item px-0">
              <div className="d-flex mb-2">
                <div className="flex-shrink-0">
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                    style={{ width: '40px', height: '40px' }}
                  >
                    {review.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">{review.name}</h6>
                      <div className="mb-2">
                        {renderStars(review.rating)}
                        <span className="ms-2 text-muted small">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Review Comment */}
                  <p className="mb-2">
                    {shouldTruncate && !isExpanded
                      ? `${review.comment.substring(0, 300)}...`
                      : review.comment}
                  </p>
                  {shouldTruncate && (
                    <button
                      className="btn btn-link btn-sm p-0 mb-2"
                      onClick={() => toggleExpanded(review._id)}
                    >
                      {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                  )}

                  {/* Review Actions */}
                  <div className="d-flex gap-3">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => handleMarkHelpful(review._id)}
                    >
                      <i className="bi bi-hand-thumbs-up me-1"></i>
                      Helpful ({review.helpful?.length || 0})
                    </button>
                    {review.canEdit && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteReview(review._id)}
                      >
                        <i className="bi bi-trash me-1"></i>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
