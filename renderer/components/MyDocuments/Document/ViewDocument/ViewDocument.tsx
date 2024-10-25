import React, { useEffect, useState } from 'react';
import { Button, Text, Image, Tabs, Paper, Loader, Pagination, Tooltip, VisuallyHidden } from '@mantine/core';
import { IconPlus, IconX } from '@tabler/icons-react';
import MainContent from '@renderer/components/MainContent';
import useLogMount from 'hooks/useLogMount';
import { useTranslation } from 'react-i18next';
import { Document } from '../../../types';
import classes from '../ViewDocument/ViewDocument.module.css';
import DocumentTitleComponent from './DocumentTitle/DocumentTitle';
import ViewTranslation from './ViewTranslation/ViewTranslation';
import { ViewPage } from './ViewPage/ViewPage';

type Props = {
  activeDocument: Document;
  onClose: () => void;
};

const ViewDocument: React.FC<Props> = ({ activeDocument, onClose }) => {
  useLogMount('ViewDocument');
  const { t } = useTranslation();
  const [activePage, setActivePage] = useState<number>(0);
  const [translationLanguage, setTranslationLanguage] = useState<string>(null);

  const onUpdate = async (action: string, data?: string, activePage?: number | string) => {
    window.electronAPI.updateDocument(action, activeDocument.documentID, data, activePage);
  };

  //adds page and reads updated document
  const handleAddPage = async () => {
    window.electronAPI.log('debug', 'Add new page button clicked by user.');
    onUpdate('addPage');
  };

  const handleClickCancelRecognition = async () => {
    window.electronAPI.log('debug', 'Cancel recognition button clicked by user.');
    await window.electronAPI.cancelRecognition();
    await onUpdate('editBrailleStatus', 'recognitionCanceled', activeDocument.pages[activePage].pageID);
  };

  // creates marked.brl file and updates value of page.brailleText to 'brailleTextAvailable'
  const handleRecognizeBraille = async () => {
    window.electronAPI.log(
      'debug',
      `Sent request to background to recognize file ${activeDocument.pages[activePage].file}.`,
    );
    await window.electronAPI.recognizeBraille(
      activeDocument.pages[activePage].file,
      activeDocument.documentID,
      activeDocument.pages[activePage].pageID,
      translationLanguage,
    );
  };

  const handleClickMiniPage = (index) => {
    window.electronAPI.log(
      'debug',
      `User clicked on miniPage: ${activeDocument.pages[index].pageID} and set it to be active`,
    );
    setActivePage(index);
  };

  const renderMiniPages = () => {
    return activeDocument.pages.map((page, index) => (
      <Paper
        key={index}
        className={` ${activePage === index ? `${classes.scannedDocMiniClicked}` : `${classes.scannedDocMini}`} `}
        onClick={() => handleClickMiniPage(index)}
        withBorder
      >
        <VisuallyHidden tabIndex={0}>{t('view_document.mini_page_number', { pageIndex: index + 1 })}</VisuallyHidden>
        {activeDocument.pages[index].file && activeDocument.pages[index].file !== 'scanInProgress' ? (
          <div>
            <Image
              src={activeDocument.pages[index].file}
              className={classes.miniImage}
              alt={t('view_document.mini_page_description_filled')}
            ></Image>
          </div>
        ) : (
          <VisuallyHidden tabIndex={0}>{t('view_document.mini_page_description_empty')}</VisuallyHidden>
        )}
      </Paper>
    ));
  };

  const renderRecognizedBraille = () => {
    return activeDocument.pages[activePage].brailleStatus === 'recognitionInProgress' ? (
      <div className={classes.brailleTextContainer}>
        <Tooltip label={t('view_document.cancel_recognition_button')}>
          <Button
            className={classes.cancelRecognition}
            size="xl"
            variant="transparent"
            onClick={handleClickCancelRecognition}
            color="red"
          >
            <IconX size={35}></IconX>
            <VisuallyHidden>{t('view_document.cancel_recognition_button')}</VisuallyHidden>
          </Button>
        </Tooltip>
        <Loader color="blue" />
        <Text tabIndex={0}>{t('view_document.recognition_runs')}</Text>
      </div>
    ) : activeDocument.pages[activePage].brailleStatus === 'brailleTextAvailable' ? (
      activeDocument.pages[activePage].brailleText
    ) : null;
  };

  // makes recognition (only if needed) and reads braille file
  useEffect(() => {
    if (
      activeDocument.pages[activePage].file &&
      activeDocument.pages[activePage].file !== 'scanInProgress' &&
      !activeDocument.pages[activePage].brailleStatus
    ) {
      handleRecognizeBraille();
    }
  }, [activeDocument?.pages[activePage]?.file, activePage, activeDocument.pages[activePage].brailleStatus]);

  const newestPageIndex = activeDocument ? activeDocument.pages.length - 1 : 0;

  // code below makes newest page focused once the number of pages changes
  useEffect(() => {
    setActivePage(newestPageIndex);
    window.electronAPI.log(
      'debug',
      `Created Page: ${activeDocument.pages[newestPageIndex].pageID} and set it to be active.`,
    );
  }, [newestPageIndex]);

  const onDelete = async () => {
    const pageToDelete = activeDocument.pages[activePage];
    await window.electronAPI.deletePage(activeDocument.documentID, pageToDelete.file, pageToDelete.pageID);
    if (activePage > 0) {
      setActivePage(activePage - 1);
    }
  };

  return (
    <MainContent
      header={
        <div className={classes.topLine}>
          <DocumentTitleComponent activeDocument={activeDocument} onUpdate={onUpdate} onClose={onClose} />
        </div>
      }
    >
      <div className={classes.contentDiv}>
        <div className={classes.scannedDocsMiniAndPlus}>
          <div className={classes.scannedDocumentsMini}>{renderMiniPages()}</div>
          <div className={classes.addDocButtonCont}>
            <Button className={classes.addDocButton} size="xl" variant="transparent" onClick={handleAddPage}>
              <IconPlus className={classes.iconPlus}></IconPlus>
              <VisuallyHidden>{t('view_document.add_page')}</VisuallyHidden>
            </Button>
          </div>
        </div>
        <div className={classes.paginationWrapper}>
          <VisuallyHidden>{t('view_document.hidden_pagination_description')}</VisuallyHidden>
          <Pagination
            value={activePage + 1}
            total={activeDocument.pages.length}
            size="md"
            onChange={(page) => {
              setActivePage(page - 1);
              window.electronAPI.log(
                'debug',
                `Pagination clicked by user. This changes active page to: ${activeDocument.pages[page - 1].pageID}.`,
              );
            }}
            withEdges
            getControlProps={(control) => {
              switch (control) {
                case 'first':
                  return { 'aria-label': 'First page' };
                case 'previous':
                  return { 'aria-label': 'Previous page' };
                case 'next':
                  return { 'aria-label': 'Next page' };
                case 'last':
                  return { 'aria-label': 'Last page' };
                default:
                  return {};
              }
            }}
            getItemProps={(page) => ({
              'aria-label': `Page ${page}`,
            })}
          />
        </div>
        <div className={classes.scannedDocs}>
          <ViewPage
            activeDocument={activeDocument}
            activePage={activePage}
            onUpdate={onUpdate}
            translationLanguage={translationLanguage}
            onDelete={onDelete}
          />
          <div className={classes.translatedDocs}>
            <Tabs defaultValue="unicode" className={classes.tab}>
              <Tabs.List>
                <Tabs.Tab value="unicode">Unicode</Tabs.Tab>
                <Tabs.Tab value="text">Text</Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value="unicode" className={classes.brailleText} tabIndex={0}>
                {renderRecognizedBraille()}
              </Tabs.Panel>
              <Tabs.Panel value="text" tabIndex={0}>
                <ViewTranslation
                  activeDocument={activeDocument}
                  activePage={activePage}
                  onUpdate={onUpdate}
                  translationLanguage={translationLanguage}
                  setTranslationLanguage={setTranslationLanguage}
                ></ViewTranslation>
              </Tabs.Panel>
            </Tabs>
          </div>
        </div>
      </div>
    </MainContent>
  );
};

export default ViewDocument;
