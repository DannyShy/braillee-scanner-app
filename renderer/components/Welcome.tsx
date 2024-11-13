import '@mantine/core/styles.css';
import {
  Button,
  Center,
  RingProgress,
  Text,
  Title,
  Loader,
  Container,
  SimpleGrid,
  Modal,
  Flex,
  VisuallyHidden,
} from '@mantine/core';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import useLogMount from 'hooks/useLogMount';
import { Trans, useTranslation } from 'react-i18next';
import { ExternalLink } from '@renderer/components/common/ExternalLink';
import classes from './Welcome.module.css';

const Welcome: React.FC = () => {
  useLogMount('Welcome');
  const { t } = useTranslation();
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>(null);
  const [downloadModelProgress, setDownloadModelProgress] = useState<number>(null);
  const [isFinishedState, setIsFinishedState] = useState<boolean>(false);
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();

  const roundedProgress = Math.ceil(downloadModelProgress / 5) * 5;

  const handleViewInitialSetupProgress = async () => {
    await window.electronAPI.addInitialSetupProgressListener(
      (progressMessage, downloadModelProgressPercentage, isFinished, errorKey) => {
        if (errorKey) {
          setProgressMessage(null);
          setDownloadModelProgress(null);
          setErrorKey(errorKey);
          return;
        } else {
          setProgressMessage(progressMessage);
          setDownloadModelProgress(downloadModelProgressPercentage);
        }

        if (isFinished === true) {
          setIsFinishedState(isFinished);
          window.electronAPI.removeInitialSetupProgressListener();
        }
      },
    );
  };

  const handleCheckDiskSpace = async () => {
    window.electronAPI.log('debug', 'Button for installing app (starting initial setup) clicked by user.');
    await window.electronAPI.addCheckDiskSpaceListener(async (checkDiskSpaceOutput) => {
      if (checkDiskSpaceOutput === 0) {
        await handleViewInitialSetupProgress();
        window.electronAPI.removeCheckDiskSpaceListener();
        window.electronAPI.initialSetup();
      } else if (typeof checkDiskSpaceOutput === 'string') {
        window.alert(
          `There is not enough space on disk. Please remove at least ${checkDiskSpaceOutput} and try again.`,
        );
      }
    });
    await window.electronAPI.checkDiskSpace();
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
        {!progressMessage && !isFinishedState && !errorKey && (
          <Container>
            <div className={classes.inner}>
              <Title className={classes.title} tabIndex={0}>
                {t('welcome.welcome_title')}
              </Title>
              <Container p={0} size={600}>
                <Text size="lg" c="dimmed" className={classes.description} tabIndex={0}>
                  {t('welcome.welcome_text_1')}
                  <br />
                  {t('welcome.welcome_text_2')}
                </Text>
              </Container>
              <Flex direction={{ base: 'column', sm: 'row' }} gap={{ base: 'sm', sm: 'lg' }} justify={{ sm: 'center' }}>
                <Button className={classes.control} size="lg" variant="default" color="gray" onClick={handleCloseApp}>
                  {t('exit_button')}
                </Button>
                <Button className={classes.control} size="lg" onClick={handleCheckDiskSpace}>
                  {t('welcome.continue_button')}
                </Button>
              </Flex>
            </div>
          </Container>
        )}

        {progressMessage && (
          <Container>
            <Container p={0} size={1000}>
              <Text size="lg" c="dimmed" className={classes.initialSetupProgress} aria-live="assertive" tabIndex={0}>
                {t(`welcome.progress.${progressMessage}`)}
              </Text>
            </Container>
            <>
              {downloadModelProgress ? (
                <Center>
                  <RingProgress
                    sections={[{ value: downloadModelProgress, color: 'teal' }]}
                    label={
                      <Center>
                        <Text aria-live="off" tabIndex={0}>
                          {downloadModelProgress}%
                        </Text>
                        <VisuallyHidden aria-live="polite">
                          {roundedProgress}% {t('welcome.progress.percentage')}
                        </VisuallyHidden>
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
                  window.electronAPI.log('debug', 'Modal for cancelling initial setup opened.');
                }}
              >
                {t('welcome.cancel_button')}
              </Button>
            </Center>
          </Container>
        )}

        {errorKey && (
          <Container>
            <Text size="lg" c="red" className={classes.description} tabIndex={0}>
              <Trans
                i18nKey={`welcome.errors.${errorKey}`}
                components={{
                  ExternalLink: <ExternalLink />,
                  strong: <strong />,
                }}
              />
            </Text>
            <Center>
              <Button className={classes.control} size="lg" color="gray" onClick={handleCloseApp}>
                {t('exit_button')}
              </Button>
            </Center>
          </Container>
        )}

        {isFinishedState && (
          <Container>
            <Text size="lg" c="dimmed" className={classes.description} tabIndex={0}>
              {t('welcome.finished_text')}
            </Text>
            <Center>
              <Button className={classes.control} size="lg" onClick={handleGoHome}>
                {t('welcome.proceed_button')}
              </Button>
            </Center>
          </Container>
        )}

        <Modal
          opened={opened}
          onClose={() => {
            close();
            window.electronAPI.log('debug', 'Button for closing modal clicked.');
          }}
          withCloseButton={true}
          centered
        >
          <SimpleGrid>
            <Center>
              <Text className={classes.modalText} tabIndex={0}>
                {t('welcome.modal_text')}
              </Text>
            </Center>
            <Flex direction={{ base: 'column', sm: 'row' }} gap={{ base: 'sm', sm: 'lg' }} justify={{ sm: 'center' }}>
              <Button
                onClick={() => {
                  handleCancelSetup();
                  close();
                  window.electronAPI.log(
                    'debug',
                    'Button for confirming cancellilng of initial setup clicked in modal.',
                  );
                }}
              >
                {t('yes_button')}
              </Button>
              <Button
                onClick={() => {
                  close();
                  window.electronAPI.log('debug', 'Button for closing modal clicked.');
                }}
              >
                {t('no_button')}
              </Button>
            </Flex>
          </SimpleGrid>
        </Modal>
      </Container>
    </Container>
  );
};

export default Welcome;
