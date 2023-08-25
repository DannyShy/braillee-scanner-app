export default function USBdevices() {
  navigator.usb.requestDevice({ filters: [] }).then((device) => {
    device.open().then(() => device.selectConfiguration(1)); // Select the first configuration.
    //   .then(() => device.claimInterface(0));
    console.log(device);
    console.log(device.vendorId);
    // navigator.usb.requestDevice({ filters: [{ vendorId: device.vendorId }] }).then((USBdevice) => {
    //   console.log(USBdevice);
    // });
  });
}
