/* eslint-disable react/prop-types */
import React from 'react';
import BookCard from './BookCard';

function BookLibrary({ bookList }) {
  return (
    <div>
      {bookList.map(
        (book: {
          metadata: {
            ISBN: React.Key | null | undefined;
            title: string;
            creator: string;
            description: string;
            coverImageSrc: string;
          };
        }) => (
          <BookCard
            key={book.metadata.ISBN}
            title={book.metadata.title}
            author={book.metadata.creator}
            // description={book.metadata.description}
            ISBN={book.metadata.ISBN}
            coverImageSrc={book.metadata.coverImageSrc}
          />
        ),
      )}
    </div>
  );
}

export default BookLibrary;
