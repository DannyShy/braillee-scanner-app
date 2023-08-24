import { Image, Button, FileButton, Group, Text } from '@mantine/core';
import React, { useState } from 'react';
import { getDevicesInfo } from './utils/getDevicesInfo';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  console.log(file);
  console.log(typeof file);

  return (
    <div>
      <Button
        radius="xl"
        size="xl"
        uppercase
        variant="gradient"
        gradient={{ from: 'orange', to: 'red' }}
        onClick={getDevicesInfo}
      >
        Scan
      </Button>
      <Group position="center">
        <FileButton
          radius="xl"
          size="xl"
          uppercase
          variant="gradient"
          gradient={{ from: 'orange', to: 'red' }}
          onChange={setFile}
          accept="image/png,image/jpeg"
        >
          {(props) => <Button {...props}>Upload image</Button>}
        </FileButton>
      </Group>

      {file && (
        <Group position="center">
          <Text size="sm" align="center" mt="sm">
            Picked file: {file.name}
          </Text>
          <Image maw={240} mx="auto" radius="md" src={file} alt="Random image" />
        </Group>
      )}
    </div>
  );
}
