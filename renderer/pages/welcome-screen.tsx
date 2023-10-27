import '@mantine/core/styles.css';
import classes from '../public/images/WelcomeScreen.module.css';
import { Button, Center, RingProgress, Text, Title, Loader, Container, SimpleGrid, Modal, Flex } from '@mantine/core';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { NextPage } from 'next';

const WelcomeScreen: NextPage = () => {
  const [initialSetupProgress, setInitialSetupProgress] = useState<string>(null);
  const [downloadModelProgress, setDownloadModelProgress] = useState<number>(null);
  const [requirementsLoading, setRequirementsLoading] = useState<boolean>(false);
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();

  const handleViewInitialSetupProgress = async () => {
    await window.electronAPI.addInitialSetupProgressListener((progress, requirementsStatus, initialSetupState) => {
      setInitialSetupProgress(initialSetupState);
      setRequirementsLoading(requirementsStatus);
      if (typeof progress === 'string') {
        setDownloadModelProgress(Number(progress));
      } else {
        setDownloadModelProgress(progress);
      }
      if (initialSetupState === 'done') {
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
    setRequirementsLoading(false); //delete model/packages as well?
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
      {downloadModelProgress === null && requirementsLoading === false && initialSetupProgress !== 'done' && (
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
        {downloadModelProgress !== null && (
          <Text size="lg" c="dimmed" className={classes.description}>
            {initialSetupProgress} in progress.
          </Text>
        )}
        {requirementsLoading === true && (
          <Text size="lg" c="dimmed" className={classes.description}>
            {initialSetupProgress} in progress.
          </Text>
        )}
        {downloadModelProgress !== null && (
          <Container>
            <RingProgress
              sections={[{ value: downloadModelProgress, color: 'teal' }]}
              label={
                <Center>
                  <Text> {downloadModelProgress}% </Text>
                </Center>
              }
            />
          </Container>
        )}
        {requirementsLoading === true && (
          <Center>
            <Loader color="blue" />
          </Center>
        )}
        {downloadModelProgress !== null && (
          <Container size={200}>
            <Button className={classes.control} size="lg" color="gray" onClick={open}>
              Cancel
            </Button>
          </Container>
        )}
        {requirementsLoading === true && (
          <Container size={200}>
            <Button className={classes.control} size="lg" color="gray" onClick={open}>
              Cancel
            </Button>
          </Container>
        )}
        {initialSetupProgress === 'done' && (
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
};

export default WelcomeScreen;
