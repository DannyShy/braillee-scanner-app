import { Image, Button, FileButton, Group, Text, Box, CloseButton } from '@mantine/core';
import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    electronAPI: any;
  }
}

const App = () => {
  const [file, setFile] = useState<File | null>(null);
  const [scannedOutputURI, setScannedOutputURI] = useState<string | null>(null);

  const handleScan = async () => {
    try {
      const scannedOutput = await window.electronAPI.scanFile();
      const formattedURI = 'file:///' + scannedOutput.replace(/\\/g, '/');
      setScannedOutputURI(formattedURI);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelPreview = async () => {
    try {
      await window.electronAPI.cancelPreview(scannedOutputURI);
      setScannedOutputURI(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReadBraille = async (brailleInput) => {
    await window.electronAPI.readBraille(brailleInput);
  };

  useEffect(() => {
    if (file) {
      const brailleInput = file.path;
      // Transfering whole file object to background ends up with error.
      // It is probably due to size of file so only file.path is transfered.
      handleReadBraille(brailleInput);
      console.log('you are home');
    }
  }, [file]);

  return (
    <div>
      <Group position="center">
        <Button
          radius="xl"
          size="xl"
          uppercase
          variant="gradient"
          gradient={{ from: 'orange', to: 'red' }}
          onClick={handleScan}
        >
          Scan
        </Button>
        <FileButton onChange={setFile} accept="image/png,image/jpeg">
          {(props) => (
            <Button
              variant="gradient"
              gradient={{ from: 'orange', to: 'red' }}
              radius="xl"
              size="xl"
              uppercase
              {...props}
            >
              Upload image
            </Button>
          )}
        </FileButton>
      </Group>

      {file && (
        <Group position="center">
          <Box maw={240} mah={1000} mx="auto">
            <Text size="sm" align="center" mt="sm">
              Picked file: {file.name}
            </Text>
            <Image
              width={500}
              height={100}
              src={URL.createObjectURL(file)}
              imageProps={{
                onLoad: () => {
                  URL.revokeObjectURL(URL.createObjectURL(file));
                },
              }}
            />
          </Box>
        </Group>
      )}

      {scannedOutputURI && (
        <Group position="center">
          <Box maw={240} mah={1000} mx="auto">
            <Image width={500} height={500} src={scannedOutputURI} />
            <Button variant="subtle" color="gray" radius="xl" size="xl" id="confirmButton" title="Keep Image">
              ✓
            </Button>
            <CloseButton title="Delete Image" size="xl" iconSize={100} onClick={handleCancelPreview} />
          </Box>
        </Group>
      )}
    </div>
  );
};

export default App;
