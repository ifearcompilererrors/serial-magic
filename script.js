let port;
let reader;
let isReading = true;
let count = 0;

const displayCard = (value) => {
  console.log(value);
  if (value.includes('UID Value')) {
    if (count % 2 === 0)
      document.getElementById('first').src = 'https://liminal11.com/wp-content/uploads/2018/04/the-magician-tarot-web.png';
    if (count % 3 === 0)
      document.getElementById('second').src = 'https://liminal11.com/wp-content/uploads/2018/04/the-magician-tarot-web.png';
    else
      document.getElementById('third').src = 'https://liminal11.com/wp-content/uploads/2018/04/the-magician-tarot-web.png';
    ++count;
    console.log(count)
  }
}

// Listen to data coming from the serial device.
const listen = async (port) => {
  const decoder = new TextDecoderStream();
  port.readable.pipeTo(decoder.writable);

  while (port.readable && isReading) {
    reader = decoder.readable.getReader();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break; // Allow the serial port to be closed later.
        displayCard(value)
      }
    } catch (e) {
      console.error(e);
    } finally {
      reader.releaseLock();
    }
  }
};

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

  listen(port);
}

async function cancel() {
  await port.close();
  await reader.cancel();
  isReading = false;
}
