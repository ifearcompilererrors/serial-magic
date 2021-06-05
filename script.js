let port;
let reader;
let isReading = true;

let count = 0; // tmp
const ids = ['first', 'second', 'third'];
let seenCards = {};

const setCardAnimation = async () => {
  let asset;

  const isDisplayed = (a) => {
    if (seenCards[a]) {
      return true;
    } else {
      seenCards[a] = true;
    }

    return false;
  }

  // demo purposes
  if (document.location.href.includes('serial-magic/index.html')) {  
    if (count % 3 == 0) asset = 'assets/justice.mp4';
    if (count % 3 == 1) asset = 'assets/tower.mp4';
    if (count % 3 == 2) asset = 'assets/death.mp4';
  } else {
    asset = await fetch('/asset');
  }

  // document.getElementById(ids[count%3]).src = asset;
  if (isDisplayed(asset)) return;

  document.getElementById(ids[count%3]).innerHTML = `<video playsinline autoplay muted loop><source type="video/mp4" src="${asset}" /></video>`;
  ++count;
};

const displayCard = (value) => {
  if (value.includes('UID')) {
    setCardAnimation();
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
