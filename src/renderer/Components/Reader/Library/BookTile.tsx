/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
// TODO: Fix it up for A11y setup. (Accessibility)
import React from 'react';
import { Popover } from '@blueprintjs/core';
import BookImage from '../../Sidebar/BookImage';
import BookPopover from './BookPopover';

interface bookTileProps {
  title: string;
  artist: string;
  description: string;
  onClick: () => void;
}

function BookTile({ title, artist, description, onClick }: bookTileProps) {
  return (
    <Popover
      hoverOpenDelay={500}
      hoverCloseDelay={1}
      minimal
      interactionKind="hover"
      content={
        <BookPopover title={title} artist={artist} description={description} />
      }
      popoverClassName="book-tile-popover"
    >
      <div className="book-tile" onClick={onClick}>
        <BookImage src="https://via.placeholder.com/80x110" alt="Book Cover" />
        <h4
          className="book-tile-title"
          style={{ paddingBottom: '10px', marginTop: '0' }}
        >
          {title || 'Book Title'}
        </h4>
      </div>
    </Popover>
  );
}

export default BookTile;
