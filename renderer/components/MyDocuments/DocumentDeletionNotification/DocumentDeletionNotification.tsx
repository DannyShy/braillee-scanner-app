import classes from './DocumentDeletionNotification.module.css';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Notification } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import useLogMount from 'hooks/useLogMount';

type Props = {};

const DocumentDeletionNotification: React.FC<Props> = () => {
  useLogMount('DocumentDeletionNotification');
  const { t } = useTranslation();
  const [deletionSuccessful, setDeletionSuccessful] = useState<null | boolean>(null);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const xIcon = <IconX style={{ width: 20, height: 20 }} />;
  const checkIcon = <IconCheck style={{ width: 20, height: 20 }} />;

  useEffect(() => {
    let timeout = null;
    window.electronAPI.addDeleteDocumentStatusListener((deletionStatus, error) => {
      // Clear previous timeout
      if (timeout) {
        clearTimeout(timeout);
      }
      setDeletionSuccessful(deletionStatus);
      setErrorMessage(error);
      timeout = setTimeout(() => {
        setDeletionSuccessful(null);
      }, 5000);
    });
    return () => {
      window.electronAPI.removeDeleteDocumentStatusListener();
      // Clear timeout when component unmounts
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);

  return (
    <div>
      {deletionSuccessful === false && errorMessage && (
        <Notification
          className={classes.notification}
          icon={xIcon}
          color="red"
          aria-live="polite"
          title={t('document_deletion_error.notification_title')}
          onClose={() => {
            setErrorMessage(null);
          }}
          closeButtonProps={{ 'aria-label': t('notification_close_button') }}
        >
          {t('document_deletion_error.notification_text', { path: errorMessage })}
        </Notification>
      )}
      {deletionSuccessful === true && (
        <Notification
          className={classes.notification}
          icon={checkIcon}
          color="teal"
          aria-live="polite"
          title={t('document_deletion_success.notification_title')}
          onClose={() => {
            setDeletionSuccessful(null);
          }}
          closeButtonProps={{ 'aria-label': t('notification_close_button') }}
        />
      )}
    </div>
  );
};

export { DocumentDeletionNotification };
