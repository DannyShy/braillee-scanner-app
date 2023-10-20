import { ActionIcon, Button, Center, RingProgress, rem, Text, Group, Title, Loader } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function InitialSetup() {
  const [downloadModelProgress, setDownloadModelProgress] = useState<number>(null);
  const [requirementsLoading, setRequirementsLoading] = useState<number>(null);
  const router = useRouter();

  const handleViewInitialSetupProgress = async () => {
    await window.electronAPI.addInitialSetupProgressListener((progress, isFinished, requirementsStatus) => {
      setRequirementsLoading(requirementsStatus);
      setDownloadModelProgress(Number(progress));
      if (isFinished) {
        window.electronAPI.removeInitialSetupProgressListener();
        setTimeout(() => {
          router.push('/home');
        }, 1000);
      }
    });
  };

  const handlecheckDiskSpace = async () => {
    await window.electronAPI.checkDiskSpace();
    await window.electronAPI.addCheckDiskSpaceListener(async (checkDiskSpaceOutput) => {
      console.log(`this is initial-setup with checkDiskSpaceOutput= ${checkDiskSpaceOutput}`);
      if (checkDiskSpaceOutput === 0) {
        handleViewInitialSetupProgress();
        window.electronAPI.removeCheckDiskSpaceListener();
        window.electronAPI.initialSetup();
      } else if (typeof checkDiskSpaceOutput === 'string') {
        window.alert(
          `There is not enough space on disk. Please remove at least ${checkDiskSpaceOutput} and try again.`,
        );
      }
    });
  };

  return (
    <main>
      <Group position="center">
        <Title>Model Download</Title>
        <Text>
          Before you start using Braille dots recognition, project dependencies and braille neural net model (1.65GB)
          need to be downloaded. Click on download if you agree.
        </Text>
        {!downloadModelProgress && !requirementsLoading && (
          <Button
            onClick={() => {
              handlecheckDiskSpace();
            }}
          >
            Download
          </Button>
        )}
        {downloadModelProgress && (
          <RingProgress
            sections={[{ value: downloadModelProgress, color: 'teal' }]}
            label={
              <Center>
                {downloadModelProgress === 100 && (
                  <ActionIcon color="teal" variant="light" radius="xl" size="xl">
                    <IconCheck style={{ width: rem(20), height: rem(20) }} />
                  </ActionIcon>
                )}
                <Text> {downloadModelProgress}% </Text>
              </Center>
            }
          />
        )}
        {downloadModelProgress === 100 && <Text>Download Successful!</Text>}
        {requirementsLoading === 1 && <Loader color="blue" />}
      </Group>
    </main>
  );
}
