import { Button } from '@mantine/core';
import classes from './NoDocuments.module.css';
import { Text } from '@mantine/core';
import React from 'react';
import useLogMount from 'hooks/useLogMount';
import { useTranslation } from 'react-i18next';

type Props = { onCreateDocument: () => void };

const NoDocuments: React.FC<Props> = ({ onCreateDocument }) => {
  const { t } = useTranslation();
  useLogMount('NoDocuments');
  return (
    <div className={classes.main}>
      <div className={classes.centeredDiv}>
        <Text className={classes.centeredText} tabIndex={0}>
          {t('no_documents_text')}
        </Text>
        <Button
          className={classes.createDocButtonCentered}
          variant="outline"
          radius="sm"
          size="lg"
          onClick={onCreateDocument}
        >
          + {t('create_document')}
        </Button>
      </div>
    </div>
  );
};

export default NoDocuments;
