import { ActionIcon, Button, Center, RingProgress, rem, Text, Group, Title } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function DownloadModel() {
  const [downloadModelProgress, setDownloadModelProgress] = useState<string>(null);
  const router = useRouter();

  const handleDownloadModel = async () => {
    //setting value to 0 to view RingProgress sooner.
    //without it it takes 2seconds to appear RingProgress, so user may click on Download twice leading to error
    setDownloadModelProgress('0');
    handleViewModelDownloadProgress();
    await window.electronAPI.downloadModel();
  };
  const handleViewModelDownloadProgress = async () => {
    await window.electronAPI.addDownloadProgressListener((progress) => {
      setDownloadModelProgress(progress);
      if (Number(downloadModelProgress) === 100) {
        window.electronAPI.removeDownloadProgressListener();
      }
    });
  };

  if (Number(downloadModelProgress) === 100) {
    setTimeout(() => {
      router.push('/home');
    }, 1000);
  }

  return (
    <main>
      <Group position="center">
        <Title>Model Download</Title>
        <Text>
          Before you start using Braille dots recognition, you need to download braille neural net model (150MB). Click
          on download if you agree.
        </Text>
        {!downloadModelProgress && <Button onClick={handleDownloadModel}>Download</Button>}
        {downloadModelProgress && (
          <RingProgress
            sections={[{ value: Number(downloadModelProgress), color: 'teal' }]}
            label={
              <Center>
                {Number(downloadModelProgress) === 100 && (
                  <ActionIcon color="teal" variant="light" radius="xl" size="xl">
                    <IconCheck style={{ width: rem(20), height: rem(20) }} />
                  </ActionIcon>
                )}
                <Text> {downloadModelProgress}% </Text>
              </Center>
            }
          />
        )}
        {Number(downloadModelProgress) === 100 && <Text>Download Suceccessful!</Text>}
      </Group>
    </main>
  );
}
