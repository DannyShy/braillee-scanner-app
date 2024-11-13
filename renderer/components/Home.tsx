import { useEffect, useState } from 'react';
import { Button, Image, Modal, Text } from '@mantine/core';
import { IconFolderOpen, IconLogout } from '@tabler/icons-react';
import useLogMount from 'hooks/useLogMount';
import { Trans, useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { useAuthenticated, useUser } from 'hooks';
import { ExternalLink } from './common/ExternalLink';
import LanguagePicker from './LanguagePicker/LanguagePicker';
import MyDocuments from './MyDocuments/MyDocuments';
import classes from './Home.module.css';

enum Pages {
  MY_DOCUMENTS = 'my_documents',
}

const data = [{ link: '', label: Pages.MY_DOCUMENTS, icon: IconFolderOpen }];

interface HomeProps {
  i18n: typeof i18n;
}

const Home: React.FC<HomeProps> = ({ i18n }) => {
  useLogMount('Home');
  const { t } = useTranslation();

  const { userLoaded, userLoading } = useAuthenticated();

  useEffect(() => {
    const handleError = (errorKey: string, errorMessage: string) => {
      setError({ key: errorKey, message: errorMessage });
    };

    window.electronAPI.addErrorListener(handleError);

    return () => {
      window.electronAPI.removeErrorListener();
    };
  }, []);
  const [activePage, setActivePage] = useState<string>(Pages.MY_DOCUMENTS);
  const [error, setError] = useState<{ key: string; message: string } | null>(null);

  const links = data.map((item) => (
    <a
      className={classes.link}
      data-active={item.label === activePage || undefined}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        setActivePage(item.label);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{t(`${item.label}`)}</span>
    </a>
  ));

  const renderComponent = () => {
    switch (activePage) {
      case Pages.MY_DOCUMENTS:
        return <MyDocuments />;
      // More cases to be added
      default:
        return null;
    }
  };

  const handleCloseApp = () => {
    window.electronAPI.log('debug', 'User clicked on Exit/Logout button.');
    window.electronAPI.closeApp();
  };

  if (userLoading || !userLoaded) {
    return null;
  }

  return (
    <div className={classes.parent}>
      <div className={classes.navbar}>
        <div className={classes.navbarMain}>
          <div className={classes.header}>
            <div className={classes.appLogoAndAppName}>
              <Image className={classes.appLogo} src="images/icon.png" alt={t('logo')} />
              <Text className={classes.appName}>DotSight</Text>
            </div>
            {/* <Code className={classes.appVersion} fw={700}>
              v1.0.0
            </Code> */}
            <LanguagePicker i18n={i18n} />
          </div>
          {links}
        </div>

        <div className={classes.footer}>
          <a href="#" className={classes.link} onClick={handleCloseApp}>
            <IconLogout className={classes.linkIcon} stroke={1.5} />
            <span>{t('exit_button')}</span>
          </a>
        </div>
      </div>
      <div className={classes.mainContent}>{renderComponent()}</div>

      <Modal opened={error !== null} onClose={() => setError(null)} title={t('errors.title')} centered>
        <Text>
          <Trans
            i18nKey={error?.key}
            components={{
              ExternalLink: <ExternalLink />,
              strong: <strong />,
            }}
          />
        </Text>
        <Button onClick={() => setError(null)} fullWidth mt="md">
          {t('common.ok')}
        </Button>
      </Modal>
    </div>
  );
};

export default Home;
