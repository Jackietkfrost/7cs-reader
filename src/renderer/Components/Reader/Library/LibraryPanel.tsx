import React from 'react';
import { ContextMenu } from '@blueprintjs/core';
import BookTile from './BookTile';
import BookContext from '../../BookContext';

interface bookTileProps {
  bookLibrary: any[];
  // userName: string;
  onBookClick: (book: any) => void;
}
function LibraryPanel({
  bookLibrary /* , userName */,
  onBookClick,
}: bookTileProps) {
  return (
    <>
      <header className="App-header"> User&#39;s Library</header>
      <div
        className="library-body"
        style={{
          backgroundColor: '#282c34',
          display: 'flex',
          flexWrap: 'wrap',
        }}
      >
        {bookLibrary.map((book) => (
          <ContextMenu content={<BookContext title={book.metadata.title} />}>
            <BookTile
              key={book.metadata.ISBN}
              title={book.metadata.title}
              artist={book.metadata.creator}
              description={book.metadata.description || ''}
              onClick={() => onBookClick(book)}
            />
          </ContextMenu>
        ))}
      </div>
    </>
  );
}

export default LibraryPanel;
