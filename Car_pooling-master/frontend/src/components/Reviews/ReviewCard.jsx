// ReviewCard.js
import React from 'react';
import './ReviewContainer.css';

const ReviewCard = ({ name, rating, comment }) => {
    return (
        <div className="review-card">
            <h3>{name}</h3>
            <div className="rating">{rating} stars</div>
            <p>{comment}</p>
        </div>
    );
};

export default ReviewCard;
