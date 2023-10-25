import '@mantine/core/styles.css';
import classes from '../public/images/WelcomeScreen.module.css';
import {
  ActionIcon,
  Button,
  Center,
  RingProgress,
  rem,
  Text,
  Title,
  Loader,
  Container,
  SimpleGrid,
  Modal,
  Flex,
} from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';

export default function WelcomeScreen() {
  const [downloadModelProgress, setDownloadModelProgress] = useState<number>(null);
  const [requirementsLoading, setRequirementsLoading] = useState<number>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();

  const handleViewInitialSetupProgress = async () => {
    setRequirementsLoading(1);
    await window.electronAPI.addInitialSetupProgressListener((progress, isFinished, requirementsStatus) => {
      setRequirementsLoading(requirementsStatus);
      setDownloadModelProgress(Number(progress));
      if (isFinished) {
        window.electronAPI.removeInitialSetupProgressListener();
      }
    });
  };

  const handlecheckDiskSpace = async () => {
    await window.electronAPI.checkDiskSpace();
    await window.electronAPI.addCheckDiskSpaceListener(async (checkDiskSpaceOutput) => {
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

  const handleCancelSetup = () => {
    setDownloadModelProgress(null);
    setRequirementsLoading(null); //delete model/packages as well?
    window.electronAPI.cancelSetup();
  };

  const handleCloseApp = () => {
    window.electronAPI.closeApp();
  };

  const handleGoHome = () => {
    router.push('/home');
  };

  return (
    <Container className={classes.wrapper} size={1400}>
      {!downloadModelProgress && !requirementsLoading && (
        <Container>
          <div className={classes.inner}>
            <Title className={classes.title}>Welcome to Braille Scanner</Title>
            <Container p={0} size={600}>
              <Text size="lg" c="dimmed" className={classes.description}>
                In order to continue, additional data has to be downloaded. This is one time setup. Do you want to
                continue?
              </Text>
            </Container>
            <div className={classes.controls}>
              <Button className={classes.control} size="lg" variant="default" color="gray" onClick={handleCloseApp}>
                Exit
              </Button>
              <Button className={classes.control} size="lg" onClick={handlecheckDiskSpace}>
                Continue and download
              </Button>
            </div>
          </div>
        </Container>
      )}

      <SimpleGrid cols={1}>
        {downloadModelProgress >= 1 && downloadModelProgress < 100 && (
          <Text size="lg" c="dimmed" className={classes.description}>
            Data download in progress.
          </Text>
        )}
        {requirementsLoading === 1 && (
          <Text size="lg" c="dimmed" className={classes.description}>
            Data download in progress.
          </Text>
        )}
        {downloadModelProgress >= 1 && downloadModelProgress < 100 && (
          <Container>
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
          </Container>
        )}
        {requirementsLoading === 1 && (
          <Center>
            <Loader color="blue" />
          </Center>
        )}
        {downloadModelProgress >= 1 && downloadModelProgress < 100 && (
          <Container size={200}>
            <Button className={classes.control} size="lg" color="gray" onClick={open}>
              Cancel
            </Button>
          </Container>
        )}
        {requirementsLoading === 1 && (
          <Container size={200}>
            <Button className={classes.control} size="lg" color="gray" onClick={open}>
              Cancel
            </Button>
          </Container>
        )}
        {downloadModelProgress === 100 && (
          <SimpleGrid>
            <Text size="lg" c="dimmed" className={classes.description}>
              Additional data has been successfully downloaded and application is ready to use.
            </Text>
            <Container size={200}>
              <Button className={classes.control} size={'lg'} onClick={handleGoHome}>
                Continue
              </Button>
            </Container>
          </SimpleGrid>
        )}
      </SimpleGrid>
      <Modal opened={opened} onClose={close} withCloseButton={true} centered>
        <SimpleGrid>
          <Center>
            <Text>Are you sure you want to cancel the data download?</Text>
          </Center>
          <Flex direction={{ base: 'column', sm: 'row' }} gap={{ base: 'sm', sm: 'lg' }} justify={{ sm: 'center' }}>
            <Button
              onClick={() => {
                handleCancelSetup();
                close();
              }}
            >
              Yes
            </Button>
            <Button onClick={close}>No </Button>
          </Flex>
        </SimpleGrid>
      </Modal>
    </Container>
  );
}
