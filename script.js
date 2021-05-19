// const main = async () => {
//   // Prompt user to select any serial port.
//   const port = await navigator.serial.requestPort();
//   // Wait for the serial port to open.
//   await port.open({ baudRate: 115200 });
//   const textDecoder = new TextDecoder();
//   // const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
//   const reader = port.readable.getReader();

//   // Listen to data coming from the serial device.
//     const { value, done } = await reader.read();
//     if (done) {
//       // Allow the serial port to be closed later.
//       reader.releaseLock();
//     }
//     // value is a string.
//     console.log(textDecoder.decode(value));
// };

//main();

class IDReader {
  constructor (port) {
    this.port = port;
  }
}

let port;
let reader;
let isReading = true;

async function connect() {
  // Filter on devices with the Arduino Uno USB Vendor/Product IDs.
  const filters = [
    { usbVendorId: 0x2341, usbProductId: 0x0043 },
    { usbVendorId: 0x2341, usbProductId: 0x0001 }
  ];

  port = await navigator.serial.requestPort({ filters });
  console.log(port);
  // Wait for the serial port to open.
  await port.open({ baudRate: 115200 });
  const textDecoder = new TextDecoderStream();
  // const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);

  // Listen to data coming from the serial device.
  while (port.readable && isReading) {
    reader = textDecoder.readable.getReader();
    console.log(reader);
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          // Allow the serial port to be closed later.
          // reader.releaseLock();
          break;
        }
        // value is a string.
        // console.log(textDecoder.decode(value));
        console.log(value);
      }
    } catch (e) {
      console.error(e);
    } finally {
      reader.releaseLock();
    }
  }
}

async function close() {
  await reader.cancel();
  await port.close();
  isReading = false;
  console.log(port);
}
