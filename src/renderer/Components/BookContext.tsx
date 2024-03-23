import React, { useState } from 'react';
import { Menu, MenuItem, MenuDivider } from '@blueprintjs/core';
import TagsEditor from './Sidebar/TagsEditor';

interface BookContextProps {
  title: string;
}
function BookContext({ title }: BookContextProps) {
  const [isTagsEditorOpen, setIsTagsEditorOpen] = useState(false);
  const handleOpenTagsEditor = () => {
    setIsTagsEditorOpen(true);
  };
  const closeTagsEditor = () => {
    setIsTagsEditorOpen(false);
  };
  return (
    <Menu>
      <MenuItem text="Rename.." icon="edit" />
      <MenuItem text="Edit Metadata" icon="eye-open" />
      <MenuItem text="Edit Tags.." icon="tag" onClick={handleOpenTagsEditor} />
      <MenuItem
        text="Find in Explorer"
        icon="folder-open"
        onClick={() =>
          window.electron.ipcRenderer.sendMessage('find-in-explorer', title)
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
      <TagsEditor isOpen={isTagsEditorOpen} onClose={closeTagsEditor} />
    </Menu>
  );
}
export default BookContext;
