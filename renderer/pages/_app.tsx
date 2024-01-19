import React from 'react';
import Head from 'next/head';
import { useDisclosure } from '@mantine/hooks';
import type { AppProps } from 'next/app';
import '@mantine/core/styles.css';
import { LoadingOverlay, MantineProvider } from '@mantine/core';
import { NextPage } from 'next';

import './global.css';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { appWithTranslation } from 'next-i18next';

export async function getStaticProps({ locale }) {
  return {
    pageProps: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

const MyApp: NextPage = ({ Component, pageProps }: AppProps) => {
  const [visible] = useDisclosure(false);
  return (
    <React.Suspense
      fallback={<LoadingOverlay visible={visible} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />}
    >
      <MantineProvider>
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
        <Component {...pageProps} />
      </MantineProvider>
    </React.Suspense>
  );
};

export default appWithTranslation(MyApp);
