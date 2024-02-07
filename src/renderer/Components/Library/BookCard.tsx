/* eslint-disable react/function-component-definition */
// BookCard.tsx
import React, { useState } from 'react';
import {
  Card,
  ContextMenu,
  Menu,
  MenuDivider,
  MenuItem,
  Overlay,
} from '@blueprintjs/core';
import BookImage from './BookImage';
import TagsEditor from './TagsEditor';

interface BookCardProps {
  title: string;
  author: string;
  ISBN: any;
  coverImageSrc: string;
}

// Should refactor this so that the description already comes stripped. We shouldn't have to do logic to break down and truncate the description in the BookCard render.
const BookCard: React.FC<BookCardProps> = ({
  title,
  author,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ISBN,
  coverImageSrc,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handleCardClick = () => {
    // Grab the book's content and send it to the Reader Panel.
    // Update the 'Last Opened' property of the book in the library.
    window.electron.ipcRenderer.sendMessage('get-book-content', title);
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <div onContextMenu={handleContextMenu}>
      <ContextMenu
        className="bp5-dark"
        content={
          <Menu>
            <MenuItem text="Rename.." icon="edit" />
            <MenuItem text="Edit Metadata" icon="eye-open" />
            <MenuItem text="Edit Tags.." icon="tag" onClick={openDialog} />
            <MenuItem
              text="Find in Explorer"
              icon="folder-open"
              onClick={() =>
                window.electron.ipcRenderer.sendMessage(
                  'find-in-explorer',
                  title,
                )
              }
            />
            <MenuDivider />
            <MenuItem
              text="Delete"
              icon="trash"
              intent="danger"
              onClick={() =>
                window.electron.ipcRenderer.sendMessage('delete-book', title)
              }
            />
          </Menu>
        }
      >
        <Card className="BookCard" interactive onClick={handleCardClick}>
          <div className="bookContent">
            <div className="bookImage">
              <BookImage
                src={coverImageSrc}
                alt="Cover art is not available."
              />
            </div>
            <div className="bookText">
              <h4>{title}</h4>
              <h6>{author}</h6>
            </div>
          </div>
        </Card>
        <Overlay isOpen={isDialogOpen} onClose={closeDialog}>
          <TagsEditor isOpen={isDialogOpen} onClose={closeDialog} />
        </Overlay>
      </ContextMenu>
    </div>
  );
};

export default BookCard;
