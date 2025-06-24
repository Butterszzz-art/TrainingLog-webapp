export async function scanBarcode() {
  if (!navigator.mediaDevices) {
    alert('Camera not available');
    return;
  }
  // simplified placeholder using barcode detector if available
  if ('BarcodeDetector' in window) {
    const detector = new BarcodeDetector({ formats: ['ean_13'] });
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    const video = document.createElement('video');
    video.srcObject = stream;
    await video.play();
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const barcodes = await detector.detect(canvas);
    stream.getTracks().forEach(t => t.stop());
    if (barcodes[0]) return barcodes[0].rawValue;
  }
  alert('Barcode scanning not supported');
}

export async function importRecipe(url) {
  try {
    const res = await fetch(url);
    const text = await res.text();
    const m = text.match(/(protein|fat|carb)s?\s*:?\s*(\d+)/gi);
    if (!m) return null;
    const result = { protein:0, carbs:0, fat:0 };
    m.forEach(pair => {
      const [_, key, val] = pair.match(/(protein|fat|carb)s?\s*:?\s*(\d+)/i);
      result[key.toLowerCase()] = Number(val);
    });
    return result;
  } catch(e) {
    console.warn('Recipe import failed', e);
    return null;
  }
}

export function planWeek(meals) {
  const groceries = {};
  meals.forEach(day => {
    day.forEach(item => {
      Object.entries(item).forEach(([k,v]) => {
        groceries[k] = (groceries[k] || 0) + v;
      });
    });
  });
  return groceries;
}

if (typeof window !== 'undefined') {
  window.scanBarcode = scanBarcode;
  window.importRecipe = importRecipe;
  window.planWeek = planWeek;
}
