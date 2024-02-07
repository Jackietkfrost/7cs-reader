import React, { useState } from 'react';
import { Dialog, Classes, Button, Intent, TagInput } from '@blueprintjs/core';

interface TagsEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

function TagsEditor({ isOpen, onClose }: TagsEditorProps) {
  const [tags, setTags] = useState<string[]>([]);

  const handleTagInputChange = (newTags: React.ReactNode[]) => {
    setTags(newTags.map((tag) => String(tag)));
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Tags Editor"
      className={Classes.DARK}
    >
      <div className={Classes.DIALOG_BODY}>
        <TagInput
          large
          fill
          values={tags}
          onChange={handleTagInputChange}
          placeholder="Add tags..."
        />
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose}>Cancel</Button>
          <Button intent={Intent.PRIMARY} onClick={onClose}>
            Accept
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

export default TagsEditor;
