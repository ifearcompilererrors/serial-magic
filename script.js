let port;
let reader;
let isReading = true;

let count = 0;
const ids = ['first', 'second', 'third'];

const setCardUrl = async () => {
  let asset;

  // demo purposes
  if (document.location.href.includes('serial-magic/index.html')) {  
    if (count%3 == 0) asset = 'https://ih1.redbubble.net/image.350564324.7307/flat,800x800,075,f.u1.jpg';
    if (count % 3 == 1) asset = 'https://i.pinimg.com/736x/23/1f/49/231f49d0d200ebcb63d35f381be24a81.jpg';
    if (count % 3 == 2) asset = 'https://i.pinimg.com/originals/8a/2d/2e/8a2d2e26d93a2d619401a0e8af8ec09e.jpg';
  } else {
    asset = await fetch('/asset');
  }

  console.log(asset);
  document.getElementById(ids[count%3]).src = asset;
};

const displayCard = (value) => {
  console.log(value);
  if (value.includes('UID')) {
    setCardUrl();
    ++count;
  }
};

const hideControls = () => {
  const controls = document.getElementById('controls');
  controls.style.display = 'none';
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
        displayCard(value);
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

  hideControls();

  listen(port);
}

async function cancel() {
  await port.close();
  await reader.cancel();
  isReading = false;
}
