import classes from './Home.module.css';
import { useEffect, useState } from 'react';
import { Image, Text } from '@mantine/core';
import { IconLogout, IconFolderOpen } from '@tabler/icons-react';
import MyDocuments from './MyDocuments/MyDocuments';
import useLogMount from 'hooks/useLogMount';

enum Pages {
  MY_DOCUMENTS = 'My Documents',
}

const data = [{ link: '', label: Pages.MY_DOCUMENTS, icon: IconFolderOpen }];

const Home: React.FC = () => {
  useLogMount('Home');
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
      <span>{item.label}</span>
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
              <Image className={classes.appLogo} src={'images/icon.png'} />
              <Text className={classes.appName}>DotSight</Text>
            </div>
            {/* <Code className={classes.appVersion} fw={700}>
              v1.0.0
            </Code> */}
          </div>
          {links}
        </div>

        <div className={classes.footer}>
          <a href="#" className={classes.link} onClick={handleCloseApp}>
            <IconLogout className={classes.linkIcon} stroke={1.5} />
            <span>Exit</span>
          </a>
        </div>
      </div>
      <div className={classes.mainContent}>{renderComponent()}</div>
    </div>
  );
};

export default Home;
