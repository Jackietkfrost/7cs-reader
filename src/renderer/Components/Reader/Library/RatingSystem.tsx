import { Icon } from '@blueprintjs/core';
import React, { useState } from 'react';

function RatingSystem() {
  const [rating, setRating] = useState(0);

  const handleStarClick = (starIndex: number) => {
    setRating(starIndex + 1);
  };

  return (
    <div>
      {[...Array(5)].map((_, index) => (
        <Icon
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className={`favorite-icon ${index < rating ? 'active' : ''}`} // Adding the 'active' class conditionally
          icon={index < rating ? 'star' : 'star-empty'}
          onClick={() => handleStarClick(index)}
        />
      ))}
    </div>
  );
}

export default RatingSystem;
