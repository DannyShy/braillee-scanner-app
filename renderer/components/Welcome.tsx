import '@mantine/core/styles.css';
import classes from './Welcome.module.css';
import { Button, Center, RingProgress, Text, Title, Loader, Container, SimpleGrid, Modal, Flex } from '@mantine/core';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import useLogMount from 'hooks/useLogMount';

const Welcome: React.FC = () => {
  useLogMount('Welcome');
  const [progressMessage, setProgressMessage] = useState<string>(null);
  const [downloadModelProgress, setDownloadModelProgress] = useState<number>(null);
  const [isFinishedState, setIsFinishedState] = useState<boolean>(false);
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();

  const handleViewInitialSetupProgress = async () => {
    await window.electronAPI.addInitialSetupProgressListener(
      (progressMessage, downloadModelProgressPercentage, isFinished) => {
        setProgressMessage(progressMessage);
        setDownloadModelProgress(downloadModelProgressPercentage);
        if (isFinished === true) {
          setIsFinishedState(isFinished);
          window.electronAPI.removeInitialSetupProgressListener();
        }
      },
    );
  };

  const handlecheckDiskSpace = async () => {
    window.electronAPI.log('debug', 'Button for installing app (starting initial setup) clicked by user.');
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
    setProgressMessage(null); //delete model/packages as well?
    window.electronAPI.cancelSetup();
    window.electronAPI.log('debug', 'Button for cancel installing app (initial setup) clicked by user.');
  };

  const handleCloseApp = () => {
    window.electronAPI.log('debug', 'Button for exiting app clicked by user.');
    window.electronAPI.closeApp();
  };

  const handleGoHome = () => {
    window.electronAPI.log('debug', 'Continue button to proceed after completing installation clicked by user.');
    window.electronAPI.log('debug', 'Page changed from welcome-screen to home-screen.');
    router.push('/home-screen');
  };

  useEffect(() => {
    window.electronAPI.log('debug', `Progress message changed to: ${progressMessage}.`);
  }, [progressMessage]);

  useEffect(() => {
    window.electronAPI.log('debug', `Download Model Progress value changed to: ${downloadModelProgress}.`);
  }, [downloadModelProgress]);

  useEffect(() => {
    window.electronAPI.log('debug', `isFinishedState value changed to: ${isFinishedState}.`);
  }, [isFinishedState]);

  return (
    <Container className={classes.wrapper} size={1400}>
      <Container className={classes.center} size={1400}>
        {!progressMessage && !isFinishedState && (
          <Container>
            <div className={classes.inner}>
              <Title className={classes.title}>Welcome to Braille Scanner</Title>
              <Container p={0} size={600}>
                <Text size="lg" c="dimmed" className={classes.description}>
                  In order to continue, additional data has to be downloaded. This is one time setup. Do you want to
                  continue?
                </Text>
              </Container>
              <Flex direction={{ base: 'column', sm: 'row' }} gap={{ base: 'sm', sm: 'lg' }} justify={{ sm: 'center' }}>
                <Button className={classes.control} size="lg" variant="default" color="gray" onClick={handleCloseApp}>
                  Exit
                </Button>
                <Button className={classes.control} size="lg" onClick={handlecheckDiskSpace}>
                  Continue and download
                </Button>
              </Flex>
            </div>
          </Container>
        )}

        {progressMessage && (
          <Container>
            <Container p={0} size={1000}>
              <Text size="lg" c="dimmed" className={classes.initialSetupProgress}>
                {progressMessage}
              </Text>
            </Container>
            <>
              {downloadModelProgress ? (
                <Center>
                  <RingProgress
                    sections={[{ value: downloadModelProgress, color: 'teal' }]}
                    label={
                      <Center>
                        <Text> {downloadModelProgress}% </Text>
                      </Center>
                    }
                  />
                </Center>
              ) : (
                <Center>
                  <Loader color="blue" />
                </Center>
              )}
            </>
            <Center>
              <Button
                className={classes.control}
                size="lg"
                color="gray"
                onClick={() => {
                  open();
                  window.electronAPI.log('debug', `Modal for cancelling initial setup opened.`);
                }}
              >
                Cancel
              </Button>
            </Center>
          </Container>
        )}

        {isFinishedState && (
          <Container>
            <Text size="lg" c="dimmed" className={classes.description}>
              Additional data has been successfully downloaded and application is ready to use.
            </Text>
            <Center>
              <Button className={classes.control} size={'lg'} onClick={handleGoHome}>
                Continue
              </Button>
            </Center>
          </Container>
        )}

        <Modal
          opened={opened}
          onClose={() => {
            close();
            window.electronAPI.log('debug', `Button for closing modal clicked.`);
          }}
          withCloseButton={true}
          centered
        >
          <SimpleGrid>
            <Center>
              <Text className={classes.modalText}>Are you sure you want to cancel the data download?</Text>
            </Center>
            <Flex direction={{ base: 'column', sm: 'row' }} gap={{ base: 'sm', sm: 'lg' }} justify={{ sm: 'center' }}>
              <Button
                onClick={() => {
                  handleCancelSetup();
                  close();
                  window.electronAPI.log(
                    'debug',
                    `Button for confirming cancellilng of initial setup clicked in modal.`,
                  );
                }}
              >
                Yes
              </Button>
              <Button
                onClick={() => {
                  close();
                  window.electronAPI.log('debug', `Button for closing modal clicked.`);
                }}
              >
                No
              </Button>
            </Flex>
          </SimpleGrid>
        </Modal>
      </Container>
    </Container>
  );
};

export default Welcome;
