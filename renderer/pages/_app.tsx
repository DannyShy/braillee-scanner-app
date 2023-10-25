import React from 'react';
import Head from 'next/head';

import type { AppProps } from 'next/app';

import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider>
      <Head>
        <title>Braille scanner</title>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Nextron desktop app" />
      </Head>
      <Component {...pageProps} />
    </MantineProvider>
  );
}

export default MyApp;
