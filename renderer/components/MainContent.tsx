import React from 'react';
import classes from './MainContent.module.css';
import { Paper } from '@mantine/core';


type Props = {
  header: React.ReactNode;
  children?: React.ReactNode;
}
const MainContent: React.FC<Props> = ({header, children}) => (
  <div className={classes.mainContent}>
    <Paper className={classes.header} shadow="sm">
      {header}
    </Paper>
    <div className={classes.content}>
      {children}
    </div>
  </div>
);

export default MainContent;
