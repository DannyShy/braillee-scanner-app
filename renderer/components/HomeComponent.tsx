import classes from '../components/HomeComponent.module.css';
import { useState } from 'react';
import { Container, Image, Text } from '@mantine/core';
import { IconLogout, IconFolderOpen } from '@tabler/icons-react';

const Home: React.FC = () => {
  const [active, setActive] = useState('Billing');

  const data = [{ link: '', label: 'My Documents', icon: IconFolderOpen }];

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

  const handleCloseApp = () => {
    window.electronAPI.closeApp();
  };

  return (
    <Container>
      <nav className={classes.navbar}>
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
      </nav>
    </Container>
  );
};

export default Home;
