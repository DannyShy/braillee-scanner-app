import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { NextPage } from 'next';

import './global.css';
import i18n from '../i18n/i18n';
import { I18nextProvider } from 'react-i18next';

declare global {
  interface Window {
    electronAPI: any;
  }
}

const MyApp: NextPage = ({ Component, pageProps }: AppProps) => {
  // Added to avoid SSR on first load of page. SSR caused hydration error caused probably due to combination of using Electron with Next.js.
  // This solution is proposed by Next.js: https://nextjs.org/docs/messages/react-hydration-error
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <MantineProvider>
      <I18nextProvider i18n={i18n} defaultNS={'common'}>
        <Head>
          <title>Braille scanner</title>
          <meta charSet="UTF-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="description" content="Nextron desktop app" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
            rel="stylesheet"
          />
        </Head>
        {isClient ? <Component {...pageProps} /> : null}
      </I18nextProvider>
    </MantineProvider>
  );
};

export default MyApp;
