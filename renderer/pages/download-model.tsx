import { ActionIcon, Button, Center, RingProgress, rem, Text, Group, Title, Loader } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function DownloadModel() {
  const [downloadModelProgress, setDownloadModelProgress] = useState<string>(null);
  const [requirementsLoading, setRequirementsLoading] = useState<number>(null);
  const router = useRouter();

  const handleDownloadModel = async () => {
    //setting value to 0 to view RingProgress sooner.
    //without it it takes 2seconds to appear RingProgress, so user may click on Download twice leading to error
    setDownloadModelProgress('0');
    handleViewModelDownloadProgress();
    await window.electronAPI.downloadModel();
  };
  const handleViewModelDownloadProgress = async () => {
    await window.electronAPI.addDownloadProgressListener((progress, isFinished) => {
      setDownloadModelProgress(progress);
      if (isFinished) {
        window.electronAPI.removeDownloadProgressListener();
      }
    });
  };

  const handleViewRequirementsStatus = async () => {
    await window.electronAPI.addRequirementsStatusListener((status) => {
      setRequirementsLoading(status);
      if (status === 1) {
        window.electronAPI.removeRequirementsStatusListener();
        setTimeout(() => {
          router.push('/home');
        }, 1000);
      }
    });
  };

  return (
    <main>
      <Group position="center">
        <Title>Model Download</Title>
        <Text>
          Before you start using Braille dots recognition, you need to download braille neural net model (150MB) and
          project dependencies (X GB). Click on download if you agree.
        </Text>
        {!downloadModelProgress && (
          <Button
            onClick={() => {
              handleDownloadModel(), handleViewRequirementsStatus();
            }}
          >
            Download
          </Button>
        )}
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
        {Number(downloadModelProgress) === 100 && <Text>Download Successful!</Text>}
        {requirementsLoading && <Loader color="blue" />}
      </Group>
    </main>
  );
}
