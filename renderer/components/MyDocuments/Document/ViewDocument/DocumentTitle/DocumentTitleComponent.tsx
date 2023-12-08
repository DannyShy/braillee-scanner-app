import React, { useEffect, useRef, useState } from 'react';
import classes from '../DocumentTitle/DocumentTitleComponent.module.css';
import { Button, TextInput, Title } from '@mantine/core';
import { IconArrowLeft, IconCheck, IconPencil, IconX } from '@tabler/icons-react';
import { Document } from '../../../../types';

type Props = {
  activeDocument: Document;
  onUpdate: (action: string, data?: string, activePage?: number | string) => void;
  onClose: () => void;
};

const DocumentTitleComponent: React.FC<Props> = ({ activeDocument, onUpdate, onClose }) => {
  const [value, setValue] = useState<string>(activeDocument.title);
  // editTitleState serves for rendering EditDocumentTitleComponent
  const [editTitleState, setEditTitleState] = useState<boolean>(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleReturnButton = () => {
    onClose();
    setEditTitleState(false);
  };

  const handleEditButtonClick = () => {
    setEditTitleState(true);
    (event) => {
      event.target.select();
    };
  };

  // 1. updates data, 2. read data, 3. sets data to be rendered accordingly, 4.exits editTitleState
  const handleClickConfirm = async () => {
    onUpdate('editTitle', value);
    setEditTitleState(false);
  };

  //returns original value to title and exits editTitleState
  const handleClickReject = async () => {
    setEditTitleState(false);
  };

  // makes selectAll effect in initual value of TextInput
  const handleFocus = (event) => {
    if (event.currentTarget.value === activeDocument.title) {
      event.target.select();
    }
  };

  // makes focus on TextInput
  useEffect(() => {
    if (editTitleState) {
      titleInputRef.current.focus();
    }
  }, []);

  return (
    <div className={classes.documentTitle}>
      <Button className={classes.returnButton} size="md" variant="transparent" onClick={handleReturnButton}>
        <IconArrowLeft></IconArrowLeft>
      </Button>
      {editTitleState ? (
        <div className={classes.editTitle}>
          <TextInput
            className={classes.textInput}
            ref={titleInputRef}
            value={value}
            onChange={(event) => setValue(event.currentTarget.value)}
            onFocus={handleFocus}
          />
          <div className={classes.topLineButtons}>
            <div>
              <Button
                className={classes.editButton}
                size="md"
                variant="transparent"
                onClick={handleClickConfirm}
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
                onClick={handleClickReject}
                color="red"
              >
                <IconX></IconX>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Title className={classes.title} size="h2">
            {activeDocument.title}
          </Title>
          <Button className={classes.editButton} size="md" variant="transparent" onClick={handleEditButtonClick}>
            <IconPencil></IconPencil>
          </Button>
        </>
      )}
    </div>
  );
};

export default DocumentTitleComponent;
