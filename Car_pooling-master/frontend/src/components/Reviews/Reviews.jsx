// ReviewContainer.js
import React from 'react';
import ReviewCard from './ReviewCard';
import './ReviewContainer.css';

const reviews = [
  {
    id: 1,
    name: 'John Doe',
    rating: 4.5,
    comment: 'Great carpooling experience! Highly recommended.',
  },
  {
    id: 2,
    name: 'John Doe',
    rating: 4.5,
    comment: 'Great carpooling experience! Highly recommended.',
  },
  {
    id: 3,
    name: 'John Doe',
    rating: 4.5,
    comment: 'Great carpooling experience! Highly recommended.',
  },
  // Add more reviews as needed
];

const Reviews = () => {
  return (
    <div className="review-container">
      <h2>Customer Reviews</h2>
      <div className="card-container">
        {reviews.map((review) => (
          <ReviewCard key={review.id} {...review} />
        ))}
      </div>
    </div>
  );
};

export default Reviews;
