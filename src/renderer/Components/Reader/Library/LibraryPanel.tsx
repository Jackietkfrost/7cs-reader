import React from 'react';
import { Button, Card } from '@blueprintjs/core';
import BookTile from './BookTile';

function ReaderPanel() {
  return (
    <>
      <header className="App-header"> User's Library</header>
      <div className="library-body" style={{ backgroundColor: '#282c34' }}>
        <BookTile />
      </div>
    </>
  );
}

export default ReaderPanel;
