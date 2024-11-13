import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Text, Stack } from '@mantine/core';
import { ExternalLink } from 'components/common/ExternalLink';
import { logout } from 'api/auth';
import { useRouter } from 'next/router';

import styles from './NoLicensePage.module.scss';

const NoLicensePage = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const onLogout = async () => {
    await logout();
    void router.replace('/login');
  };

  return (
    <Stack className={styles.noLicensePage} align="center" justify="center">
      <Text size="xl">{t('no_license.title')}</Text>
      <Text size="md">{t('no_license.description')}</Text>
      <Text size="md" className={styles.getLicenseText}>
        {t('no_license.get_license')}{' '}
        <ExternalLink href="https://braillee.com/dotsight">{t('no_license.website')}</ExternalLink>.
      </Text>
      <Button className={styles.logoutButton} color="red" onClick={onLogout}>
        {t('no_license.logout')}
      </Button>
    </Stack>
  );
};

export default NoLicensePage;
