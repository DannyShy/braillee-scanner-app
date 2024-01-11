import React, { useEffect, useRef, useState } from 'react';
import classes from './DocumentTitle.module.css';
import { Button, TextInput, Title } from '@mantine/core';
import { IconArrowLeft, IconCheck, IconFileExport, IconPencil, IconX } from '@tabler/icons-react';
import { Document } from '../../../../types';

type Props = {
  activeDocument: Document;
  onUpdate: (action: string, data?: string, activePage?: number | string) => void;
  onClose: () => void;
};

const DocumentTitle: React.FC<Props> = ({ activeDocument, onUpdate, onClose }) => {
  const [value, setValue] = useState<string>(activeDocument.title);
  // editTitleState serves for rendering EditDocumentTitleComponent
  const [editTitleState, setEditTitleState] = useState<boolean>(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleReturnButtonClick = () => {
    window.electronAPI.log('debug', 'Return button clicked by user.');
    onClose();
    setEditTitleState(false);
  };

  const handleEditTitleButtonClick = () => {
    window.electronAPI.log('debug', 'Edit title button clicked by user.');
    setEditTitleState(true);
  };

  const handleExportButtonClick = async () => {
    window.electronAPI.log('debug', 'Export button clicked by user.');
    window.electronAPI.exportDocument(activeDocument);
  };

  // 1. updates data, 2. read data, 3. sets data to be rendered accordingly, 4.exits editTitleState
  const handleConfirmEditedTitleClick = async () => {
    window.electronAPI.log('debug', 'Confirm edited title button clicked by user.');
    onUpdate('editTitle', value);
    setEditTitleState(false);
  };

  //returns original value to title and exits editTitleState
  const handleRejectEditedTitleClick = async () => {
    window.electronAPI.log('debug', 'Cancel editing title button clicked by user.');
    setEditTitleState(false);
  };

  // makes focus on TextInput
  useEffect(() => {
    if (editTitleState) {
      titleInputRef.current.select();
    }
    window.electronAPI.log('debug', `Edit title state changed to: ${editTitleState}`);
  }, [editTitleState]);

  useEffect(() => {
    if (editTitleState) {
      window.electronAPI.log('debug', `Current value of edited title is: ${value}.`);
    }
  }, [value]);

  useEffect(() => {
    window.electronAPI.log('debug', 'DocumentTitle component mounted.');
    return () => {
      window.electronAPI.log('debug', 'DocumentTitle component unmounted.');
    };
  }, []);

  return (
    <div className={classes.documentTitle}>
      <Button className={classes.returnButton} size="md" variant="transparent" onClick={handleReturnButtonClick}>
        <IconArrowLeft></IconArrowLeft>
      </Button>
      {editTitleState ? (
        <div className={classes.editTitle}>
          <TextInput
            className={classes.textInput}
            ref={titleInputRef}
            value={value}
            onChange={(event) => setValue(event.currentTarget.value)}
          />
          <div className={classes.topLineButtons}>
            <div>
              <Button
                className={classes.editButton}
                size="md"
                variant="transparent"
                onClick={handleConfirmEditedTitleClick}
                color="green"
              >
                <IconCheck></IconCheck>
              </Button>
            </div>
            <div>
              <Button
                className={classes.editButton}
                size="md"
                variant="transparent"
                onClick={handleRejectEditedTitleClick}
                color="red"
              >
                <IconX></IconX>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className={classes.notEditStateContent}>
          <div className={classes.titleAndEditButton}>
            <Title className={classes.title} size="h2">
              {activeDocument.title}
            </Title>
            <Button className={classes.editButton} size="md" variant="transparent" onClick={handleEditTitleButtonClick}>
              <IconPencil></IconPencil>
            </Button>
          </div>
          <Button
            className={classes.exportButton}
            variant="outline"
            radius="sm"
            size="md"
            onClick={handleExportButtonClick}
          >
            <IconFileExport></IconFileExport>
            <p>Export</p>
          </Button>
        </div>
      )}
    </div>
  );
};

export default DocumentTitle;
