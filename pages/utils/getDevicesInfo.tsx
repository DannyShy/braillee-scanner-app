async function getDevicesInfo() {
  try {
    const devices = await window.navigator.mediaDevices.enumerateDevices();
    console.log(devices);
    devices.forEach((result) => {
      if (result.kind === 'videoinput') {
        console.log(result);
      }
    });
  } catch (error) {
    console.error('eefefwfe:', error);
  }
}

export { getDevicesInfo };
