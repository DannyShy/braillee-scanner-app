import classes from '../components/HomeComponent.module.css';
import MyPagesComponent from './main/MyPagesComponent';
import { useState } from 'react';
import { Image, Text } from '@mantine/core';
import { IconLogout, IconFolderOpen } from '@tabler/icons-react';
import MyDocumentsEmptyComponent from './main/MyDocumentsEmptyComponent';

const Page = {
  1: 'My Documents',
};

const data = [{ link: '', label: Page[1], icon: IconFolderOpen }];

const Home: React.FC = () => {
  const [active, setActive] = useState(Page[1]);
  //if there is document created docsState will be true and MyDocumentsComponent will render
  const [docsState, setDocsState] = useState<boolean>(false);
  const [activeDocument, setActiveDocument] = useState(null);

  const updateDocsState = (value: boolean) => {
    setDocsState(value);
  };

  const links = data.map((item) => (
    <a
      className={classes.link}
      data-active={item.label === active || undefined}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        setActive(item.label);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

  const renderComponent = () => {
    switch (active) {
      case Page[1]:
        if (docsState) {
          return <MyPagesComponent updateDocsState={updateDocsState} activeDocument={activeDocument} />;
        } else {
          return <MyDocumentsEmptyComponent updateDocsState={updateDocsState} setActiveDocument={setActiveDocument} />;
        }
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
