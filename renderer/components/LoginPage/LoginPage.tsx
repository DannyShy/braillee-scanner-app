import React, { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Text, TextInput } from '@mantine/core';
import { ExternalLink } from 'components/common/ExternalLink';
import { checkToken, login } from 'api/auth';
import { useUser } from 'hooks';
import { useRouter } from 'next/router';
import { LoginToken } from 'types/auth';
import LanguagePicker from 'components/LanguagePicker/LanguagePicker';

import styles from './LoginPage.module.scss';

const isEmailValid = (email: string) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user, loadUser, userLoaded } = useUser();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loginToken, setLoginToken] = useState<LoginToken | null>(null);
  const [waitingForAuthorization, setWaitingForAuthorization] = useState(false);
  const valid = isEmailValid(email);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError(null);
    setSubmitting(true);
    setLoginToken(null);

    try {
      setLoginToken(await login(email, i18n.language));
      setWaitingForAuthorization(true);
    } catch (e) {
      console.error(e)
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };
  //
  const onCancel = () => {
    setLoginToken(null);
    setWaitingForAuthorization(false);
  };

  useEffect(() => {
    if (!waitingForAuthorization) {
      return;
    }

    if (userLoaded && user) {
      void router.replace('/home-screen');
      return;
    }

    const intervalID = setInterval(async () => {
      try {
        if (loginToken) {
          await checkToken(loginToken.email, loginToken.token);
          setLoginToken(null);
        }
        await loadUser();
      } catch (e) {
        // ignore
      }
    }, 2000);

    return () => {
      clearInterval(intervalID);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waitingForAuthorization, user, userLoaded]);

  return (
    <div className={styles.loginPage}>
      {waitingForAuthorization ? (
        <>
          <Text size="xl">{t('login.check_email')}</Text>
          <Text size="md">
            {t('login.magic_link_sent')} <Text component="u">{email}</Text>.
          </Text>
          <Text size="md">{t('login.click_link_to_login')}</Text>
          <Button className={styles.cancelButton} color="red" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        </>
      ) : (
        <>
          <div className={styles.languageSelectorWrapper}>
            <LanguagePicker i18n={i18n} />
          </div>
          <form className={styles.loginForm} onSubmit={onSubmit}>
            <img className={styles.logo} src="images/logo.png" alt="braillee logo" />
            <div className={styles.poweredBy}>
              <Text className={styles.poweredByText} size="xs">
                Powered by
              </Text>
              <img className={styles.hotovoLogo} src="images/hotovo.svg" alt="hotovo logo" />
            </div>
            <TextInput
              className={styles.emailInput}
              label={t('login.email_label')}
              placeholder={t('login.email_placeholder')}
              value={email}
              error={!!email && !isEmailValid(email) ? t('login.invalid_email') : null}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              autoFocus
            />
            {error && (
              <Text size="sm" c="red">
                {error}
              </Text>
            )}
            <Button type="submit" className={styles.loginButton} variant="filled" disabled={submitting || !valid}>
              {submitting ? t('login.submitting') : t('login.submit')}
            </Button>
          </form>
          <div className={styles.noAccountSection}>
            <Text size="sm">
              {t('login.no_account')}{' '}
              <ExternalLink href="https://www.glitcher.sk/dotsight">{t('login.website')}.</ExternalLink>
            </Text>
          </div>
        </>
      )}
    </div>
  );
};

export default LoginPage;
