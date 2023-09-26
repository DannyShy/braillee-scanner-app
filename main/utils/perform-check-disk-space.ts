import checkDiskSpace from 'check-disk-space';

const bytesToSize = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) {
    return 'n/a';
  }

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  if (i === 0) return `${bytes} ${sizes[i]}`;
  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
};

const performCheckDiskSpace = () => {
  checkDiskSpace('C:/').then((diskSpace) => {
    const appSize = 871333037057; // real app size value have to be added here
    if (diskSpace.free < appSize) {
      console.log(
        `There is not enough space on disk. 
        Please remove at least ${bytesToSize(appSize - diskSpace.free)} and try again.`,
      );
    }
  });
};

export { performCheckDiskSpace };
