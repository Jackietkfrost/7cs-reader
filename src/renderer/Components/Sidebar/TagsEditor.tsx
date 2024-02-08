import React, { useState } from 'react';
import {
  Dialog,
  DialogBody,
  DialogFooter,
  Classes,
  Button,
  TagInput,
} from '@blueprintjs/core';

interface TagsEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

function TagsEditor({ isOpen, onClose }: TagsEditorProps) {
  const [tags, setTags] = useState<string[]>([]);

  const handleTagInputChange = (newTags: React.ReactNode[]) => {
    setTags(newTags.map((tag) => String(tag)));
  };

  const handleOnAddTag = () => {
    window.electron.ipcRenderer.sendMessage('add-tag', tags);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Tags Editor"
      className={Classes.DARK}
      icon="tag"
    >
      <DialogBody>
        <TagInput
          large
          fill
          values={tags}
          onChange={handleTagInputChange}
          placeholder="Add tags..."
          addOnBlur
          onAdd={handleOnAddTag}
        />
      </DialogBody>
      <DialogFooter
        actions={
          <Button intent="primary" onClick={onClose}>
            Done
          </Button>
        }
      />
    </Dialog>
  );
}

export default TagsEditor;
