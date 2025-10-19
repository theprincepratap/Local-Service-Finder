import { useState } from 'react';
import { FiStar, FiThumbsUp, FiMessageCircle, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ReviewsSection = () => {
  const [filterRating, setFilterRating] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);

  // Mock data
  const reviews = [
    {
      id: 1,
      client: 'Raj Kumar',
      rating: 5,
      date: '2025-10-15',
      service: 'Plumbing Service',
      comment: 'Excellent work! Very professional and completed the job quickly. Highly recommend!',
      helpful: 12,
      reply: null,
    },
    {
      id: 2,
      client: 'Sita Patel',
      rating: 4,
      date: '2025-10-14',
      service: 'Electrical Repair',
      comment: 'Good job. Arrived on time and fixed the issue. One star less because I had to follow up for the invoice.',
      helpful: 8,
      reply: {
        text: 'Thank you for your feedback! Sorry about the invoice delay. I\'ve improved my process.',
        date: '2025-10-15',
      },
    },
    {
      id: 3,
      client: 'Priya Singh',
      rating: 5,
      date: '2025-10-12',
      service: 'Carpentry',
      comment: 'Amazing craftsmanship! The wardrobe looks brand new. Will definitely hire again.',
      helpful: 15,
      reply: {
        text: 'Thanks for the kind words! Happy to help anytime.',
        date: '2025-10-13',
      },
    },
    {
      id: 4,
      client: 'Neha Gupta',
      rating: 4,
      date: '2025-10-10',
      service: 'Painting',
      comment: 'Quality work but took a bit longer than expected. Overall satisfied with the result.',
      helpful: 5,
      reply: null,
    },
    {
      id: 5,
      client: 'Amit Shah',
      rating: 5,
      date: '2025-10-09',
      service: 'AC Repair',
      comment: 'Super fast service! AC working perfectly now. Great guy!',
      helpful: 20,
      reply: null,
    },
    {
      id: 6,
      client: 'Ravi Verma',
      rating: 3,
      date: '2025-10-08',
      service: 'Plumbing',
      comment: 'Work was okay but had to call back for a minor leak. Fixed it the second time.',
      helpful: 3,
      reply: {
        text: 'Sorry for the inconvenience! I\'ve double-checked everything this time. Thank you for giving me another chance!',
        date: '2025-10-09',
      },
    },
  ];

  const filteredReviews = filterRating === 'all'
    ? reviews
    : reviews.filter((review) => review.rating === parseInt(filterRating));

  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((rating) => ({
    stars: rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100,
  }));

  const handleReply = () => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }
    toast.success('Reply posted successfully!');
    setShowReplyModal(false);
    setReplyText('');
    setSelectedReview(null);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <FiStar
            key={i}
            size={16}
            className={i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h2>
        <p className="text-gray-600 mt-1">See what clients are saying about your work</p>
      </div>

      {/* Overall Rating Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card text-center bg-gradient-to-br from-yellow-50 to-yellow-100">
          <p className="text-sm text-yellow-700 mb-2">Overall Rating</p>
          <div className="text-5xl font-bold text-yellow-900 my-4">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex justify-center mb-2">{renderStars(Math.round(averageRating))}</div>
          <p className="text-sm text-yellow-700">Based on {reviews.length} reviews</p>
        </div>

        {/* Rating Breakdown */}
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">Rating Breakdown</h3>
          <div className="space-y-3">
            {ratingBreakdown.map((item) => (
              <div key={item.stars} className="flex items-center gap-4">
                <div className="flex items-center gap-1 w-20">
                  <span className="text-sm font-medium text-gray-700">{item.stars}</span>
                  <FiStar size={14} className="text-yellow-500 fill-yellow-500" />
                </div>
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-2 flex-wrap">
          <FiFilter className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700 mr-2">Filter by rating:</span>
          {['all', '5', '4', '3', '2', '1'].map((rating) => (
            <button
              key={rating}
              onClick={() => setFilterRating(rating)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterRating === rating
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {rating === 'all' ? 'All' : `${rating} ★`}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="card hover:shadow-lg transition-shadow">
            {/* Review Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 font-semibold text-lg">
                    {review.client.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{review.client}</h4>
                  <p className="text-sm text-gray-600">{review.service}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(review.rating)}
                    <span className="text-xs text-gray-500">{review.date}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Content */}
            <p className="text-gray-700 mb-4">{review.comment}</p>

            {/* Review Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2">
                  <FiThumbsUp size={16} />
                  <span>Helpful ({review.helpful})</span>
                </button>
              </div>
              {!review.reply && (
                <button
                  onClick={() => {
                    setSelectedReview(review);
                    setShowReplyModal(true);
                  }}
                  className="btn btn-outline btn-sm flex items-center gap-2"
                >
                  <FiMessageCircle size={16} />
                  Reply
                </button>
              )}
            </div>

            {/* Worker Reply */}
            {review.reply && (
              <div className="mt-4 ml-8 p-4 bg-primary-50 border-l-4 border-primary-500 rounded">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">You</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">Your Reply</span>
                      <span className="text-xs text-gray-500">{review.reply.date}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{review.reply.text}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="card text-center py-12">
          <FiStar className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900">No reviews found</h3>
          <p className="text-gray-600 mt-2">Try adjusting your filters</p>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reply to Review</h3>

            {/* Original Review */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">
                    {selectedReview.client.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{selectedReview.client}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(selectedReview.rating)}
                    <span className="text-xs text-gray-500">{selectedReview.date}</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 mt-2">{selectedReview.comment}</p>
            </div>

            {/* Reply Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Reply</label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a professional and helpful response..."
                className="input w-full h-32 resize-none"
              ></textarea>
              <p className="text-sm text-gray-500 mt-1">
                Be professional, courteous, and address their feedback constructively.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button onClick={handleReply} className="btn btn-primary flex-1">
                Post Reply
              </button>
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyText('');
                  setSelectedReview(null);
                }}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
