// TODO: Fix the need to have these eslint disables.
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unused-prop-types */
import React from 'react';
import { HTMLSelect } from '@blueprintjs/core';

interface LibrarySortProps {
  books: any[];
  // setSortedBooks: React.Dispatch<React.SetStateAction<any[]>>; // Callback to update the sorted books in BookLibrary
}

function LibrarySort({ books }: LibrarySortProps) {
  const handleSortTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sortValue = e.target.value;
    window.electron.ipcRenderer.sendMessage('library-sort', sortValue);
  };

  return (
    <div>
      <HTMLSelect
        iconName="caret-down"
        className="library-sorter"
        onChange={handleSortTypeChange}
      >
        <option value="title">Title</option>
        <option value="author">Author</option>
      </HTMLSelect>
    </div>
  );
}

export default LibrarySort;
