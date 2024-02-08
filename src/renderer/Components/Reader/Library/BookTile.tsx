import React from 'react';
import { Button, Card } from '@blueprintjs/core';

function ReaderPanel() {
  return (
    <div className="book-tile">
      <Card>
        <div className="book-tile-title">Book Title</div>
        <div className="book-tile-author">Book Author</div>
      </Card>
    </div>
  );
}

export default ReaderPanel;
