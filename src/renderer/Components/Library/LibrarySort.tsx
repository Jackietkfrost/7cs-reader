/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unused-prop-types */
import React from 'react';
import { HTMLSelect } from '@blueprintjs/core';

interface LibrarySortProps {
  books: any[];
  setSortedBooks: React.Dispatch<React.SetStateAction<any[]>>; // Callback to update the sorted books in BookLibrary
}

function LibrarySort({ books, setSortedBooks }: LibrarySortProps) {
  const handleSortTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sortValue = e.target.value;
    window.electron.ipcRenderer.sendMessage('library-sort', sortValue);
  };

  return (
    <div>
      <HTMLSelect onChange={handleSortTypeChange}>
        <option value="title">Title</option>
        <option value="author">Author</option>
      </HTMLSelect>
    </div>
  );
}

export default LibrarySort;

// import React, { useState } from 'react';
// import { HTMLSelect } from '@blueprintjs/core';

// interface LibrarySortProps {
//   books: any[];
//   setSortedBooks: React.Dispatch<React.SetStateAction<any[]>>;
// }

// const LibrarySort: React.FC<LibrarySortProps> = ({ books, setSortedBooks }) => {
//   const [sortType, setSortType] = useState<string>('title');

//   const handleSortTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const selectedSortType = e.target.value;
//     setSortType(selectedSortType);

//     // Sorting the books array based on the selected sort type
//     if (selectedSortType === 'title') {
//       const sortedByTitle = books.sort((a, b) =>
//         (a.metadata.author || '').localeCompare(b.metadata.title),
//       );
//       setSortedBooks(sortedByTitle);
//       console.log(sortedByTitle);
//     } else if (selectedSortType === 'author') {
//       const sortedByAuthor = books.sort((a, b) =>
//         (a.metadata.author || '').localeCompare(b.metadata.author),
//       );
//       console.log(sortedByAuthor);
//       setSortedBooks(sortedByAuthor);
//     }
//   };

//   return (
//     <div>
//       <HTMLSelect value={sortType} onChange={handleSortTypeChange}>
//         <option value="title">Title</option>
//         <option value="author">Author</option>
//       </HTMLSelect>
//     </div>
//   );
// };

// export default LibrarySort;
