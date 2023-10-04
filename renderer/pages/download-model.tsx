import { ActionIcon, Button, Center, RingProgress, rem, Text } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

export default function downloadModel() {
  const [downloadModelProgress, setDownloadModelProgress] = useState<string>(null);

  const handleDownloadModel = async () => {
    await window.electronAPI.downloadModel();
  };
  const handleViewModelDownloadProgress = async () => {
    await window.electronAPI.handleModelDownloadProgressData((Progress) => {
      setDownloadModelProgress(Progress);
    });
  };

  useEffect(() => {
    handleViewModelDownloadProgress();
  }, [downloadModelProgress]);

  if (downloadModelProgress === '100') {
    window.electronAPI.goToHomePage();
  }

  return (
    <main>
      <h1>ModelDownload</h1>
      <p>
        Before you start using Braille dots recogniction, you need to download braille neural net model (150MB). Click
        on download if you agree.
      </p>
      <Button onClick={handleDownloadModel}>Download</Button>
      {downloadModelProgress && (
        <RingProgress
          sections={[{ value: Number(downloadModelProgress), color: 'teal' }]}
          label={
            <Center>
              {downloadModelProgress === '100' && (
                <ActionIcon color="teal" variant="light" radius="xl" size="xl">
                  <IconCheck style={{ width: rem(22), height: rem(22) }} />
                </ActionIcon>
              )}
              <Text> {downloadModelProgress}% </Text>
            </Center>
          }
        />
      )}
    </main>
  );
}
