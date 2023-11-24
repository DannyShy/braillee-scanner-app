import classes from '../components/HomeComponent.module.css';
import { useState } from 'react';
import { Image, Text } from '@mantine/core';
import { IconLogout, IconFolderOpen } from '@tabler/icons-react';
import MyDocuments from './main/MyDocuments';

enum Pages {
  MY_DOCUMENTS = 'My Documents',
}

const data = [{ link: '', label: Pages.MY_DOCUMENTS, icon: IconFolderOpen }];

const Home: React.FC = () => {
  const [activePage, setActivePage] = useState<string>(Pages.MY_DOCUMENTS);
  //if there is document created docsState will be true and MyPagesComponent will render
  const [docsState, setDocsState] = useState<boolean>(false);
  const [activeDocument, setActiveDocument] = useState<number>(null);

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
        return (
          <MyDocuments
            docsState={docsState}
            setDocsState={setDocsState}
            activeDocument={activeDocument}
            setActiveDocument={setActiveDocument}
          />
        );

      // More cases to be added
      default:
        return null;
    }
  };

  const handleCloseApp = () => {
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
