import React from 'react';

interface ReaderPanelProps {
  clickedBookName: string;
  clickedBookContent: string;
}

function ReaderPanel({
  clickedBookName,
  clickedBookContent,
}: ReaderPanelProps) {
  const [bookName, setBookName] = React.useState('Book Name');
  if (bookName)
    return (
      <>
        <header className="App-header">{bookName}</header>
        <div className="book-content">
          <span>Book Content</span>
        </div>
      </>
    );
}

export default ReaderPanel;
