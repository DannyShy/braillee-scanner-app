import { Image, Button, FileButton, Group, Text, Box } from '@mantine/core';
import React, { useState } from 'react';

import USBdevices from './utils/USBdevices';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  console.log(file);
  console.log(typeof file);

  return (
    <div>
      <Group position="center">
        <Button
          radius="xl"
          size="xl"
          uppercase
          variant="gradient"
          gradient={{ from: 'orange', to: 'red' }}
          onClick={USBdevices}
        >
          Scan
        </Button>
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
          <Box maw={240} mah={1000} mx="auto">
            <Text size="sm" align="center" mt="sm">
              Picked file: {file.name}
            </Text>
            <Image
              width={500}
              height={100}
              src={URL.createObjectURL(file)}
              imageProps={{ onLoad: () => URL.revokeObjectURL(URL.createObjectURL(file)) }}
            />
          </Box>
        </Group>
      )}
    </div>
  );
}
