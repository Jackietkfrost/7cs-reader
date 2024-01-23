/* eslint-disable react/function-component-definition */
// BookCard.tsx
import React from 'react';
import { Card } from '@blueprintjs/core';
import BookImage from './BookImage';

interface BookCardProps {
  title: string;
  author: string;
  description: string;
  ISBN: any;
  coverImageSrc: string;
}

// Should refactor this so that the description already comes stripped. We shouldn't have to do logic to break down and truncate the description in the BookCard render.
const BookCard: React.FC<BookCardProps> = ({
  title,
  author,
  description,
  ISBN,
  coverImageSrc,
}) => {
  const stripHtmlTags = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const strippedDescription = description
    ? stripHtmlTags(description)
    : 'No Description Provided';

  const truncatedDescription =
    strippedDescription.length > 140
      ? `${strippedDescription.substring(0, 140)}...`
      : strippedDescription;

  const handleCardClick = () => {
    // Send a message to the main process to give us the book's content to display on the Reader Panel.
    window.electron.ipcRenderer.sendMessage('get-book-content', title);
    // Grab the book's toc and send it to the Reader Panel.
  };

  return (
    <Card className="BookCard" interactive onClick={handleCardClick}>
      <div className="bookContent">
        <div className="bookImage">
          <BookImage src={coverImageSrc} alt="Cover art is not available." />
        </div>
        <div className="bookText">
          <h4>{title}</h4>
          <h6>{author}</h6>
          <p>{truncatedDescription}</p>
        </div>
      </div>
    </Card>
  );
};

export default BookCard;
