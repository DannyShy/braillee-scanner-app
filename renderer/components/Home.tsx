import classes from './Home.module.css';
import { useState } from 'react';
import { Image, Text } from '@mantine/core';
import { IconLogout, IconFolderOpen } from '@tabler/icons-react';
import MyDocuments from './MyDocuments/MyDocuments';
import useLogMount from 'hooks/useLogMount';
import { useTranslation } from 'react-i18next';
import LanguagePicker from './LanguagePicker/LanguagePicker';
import i18n from 'i18next';

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
  const [activePage, setActivePage] = useState<string>(Pages.MY_DOCUMENTS);

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

  return (
    <div className={classes.parent}>
      <div className={classes.navbar}>
        <div className={classes.navbarMain}>
          <div className={classes.header}>
            <div className={classes.appLogoAndAppName}>
              <Image className={classes.appLogo} src={'images/icon.png'} alt={t('logo')} />
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
    </div>
  );
};

export default Home;
