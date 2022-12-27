const TAROT_IDS = Object.freeze({
  '0x70 0xCC 0xF9': 'the fool',
  '0x80 0xC6 0xED': 'the magician',
  '0x10 0xBF 0xF9': 'the high priestess',
  '0x40 0x46 0xF7': 'the empress',
  '0x10 0xD9 0xF7': 'the emperor',
  '0x60 0xF3 0xEB': 'the hierophant',
  '0xE0 0xCD 0xF9': 'the lovers',
  '0xD0 0xBC 0xF8': 'the chariot',
  '0x40 0x72 0xF5': 'strength',
  '0xC0 0x5C 0xE9': 'the hermit',
  '0xE0 0x16 0xE8': 'wheel of fortune',
  '0x20 0xE0 0xF0': 'justice',
  '0x50 0x58 0xF2': 'the hanged man',
  '0xF0 0x6F 0xF5': 'death',
  '0xE0 0xA1 0xEC': 'temperance',
  '0x90 0xB2 0xFA': 'the devil',
  '0x10 0x4D 0xF9': 'the tower',
  '0x70 0x40 0xFA': 'the star',
  '0x70 0xF8 0xEA': 'the moon',
  '0x0 0x9 0xEC': 'the sun',
  '0xF0 0x13 0xFB': 'judgement',
  '0x10 0xAE 0xF4': 'the world',
});

let port;
let reader;
let isReading = true;

let count = 0;
const ids = ['first', 'second', 'third'];
let seenCards = {};

const reset = () => {
  ['first', 'second', 'third'].forEach((id) => {
    document.getElementById(id).style.display = 'none';
    document.getElementById(id).innerHTML = '';
  });
  count = 0;
  seenCards = {};
};

const setCardAnimation = async (cardName) => {
  let asset;

  const isDisplayed = (a) => {
    if (seenCards[a]) {
      return true;
    } else {
      seenCards[a] = true;
    }

    return false;
  }

  asset = `assets/${cardName}.mp4`;

  if (isDisplayed(asset)) return;

  console.log(document.getElementById(ids[count % 3]));
  document.getElementById(ids[count % 3]).style.display = 'block';
  document.getElementById(ids[count % 3]).innerHTML = `<video playsinline autoplay muted loop><source type="video/mp4" src="${asset}" /></video>`;
  ++count;
};

const displayCard = (value) => {
  console.log(value)
  let cardName;
  try {
    cardName = TAROT_IDS[value.match(/(\dx[\d|\w][\d|\w]?\s?){3}/gm)[0].trim()];
  } catch (e) {
    console.log('Stream interrupted. Trying again.')
  }
  if (cardName) {
    console.log(cardName);
    setCardAnimation(cardName);
  } else {
    reset();
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
