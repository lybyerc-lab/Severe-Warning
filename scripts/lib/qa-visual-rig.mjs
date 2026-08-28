// [SW:QA:VISUAL_RIG] Shared machinery for looking at the rendered game.
//
// Both of this repo's pixel-measuring harnesses need the same two things: a way
// to make the animation phase a function of the build rather than of wall-clock
// luck, and a PNG decoder. They lived inside compare-phase5-visual-baseline.mjs,
// which meant the second harness could only get them by copy-paste.
//
// installQaFrameController freezes requestAnimationFrame from page load, so
// every frame the world has ever advanced is one the caller stepped. Stepping
// the SAME timestamp twice re-renders without advancing anything, which is what
// makes a before/after pair comparable: the only difference is the change under
// test.

import { inflateSync } from 'node:zlib';

function installQaFrameController(seed) {
  let randomState = seed >>> 0;
  Math.random = () => {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
    return randomState / 0x100000000;
  };

  const nativeRaf = window.requestAnimationFrame.bind(window);
  const nativeCancelRaf = window.cancelAnimationFrame.bind(window);
  const nativePerformanceNow = performance.now.bind(performance);
  const nativeDateNow = Date.now.bind(Date);

  let frozen = true;
  let simulatedTimestamp = 1000.0;
  let nextCallbackId = 1;
  let steppedFrameCount = 0;
  const timestampSequence = [];
  const queuedCallbacks = new Map();
  const activeCallbacks = new Map();

  performance.now = () => (frozen ? simulatedTimestamp : nativePerformanceNow());
  Date.now = () => (frozen ? Math.round(simulatedTimestamp) : nativeDateNow());

  window.requestAnimationFrame = (callback) => {
    const id = nextCallbackId++;
    if (frozen) {
      queuedCallbacks.set(id, callback);
      return id;
    }
    const nativeId = nativeRaf((timestamp) => {
      activeCallbacks.delete(id);
      simulatedTimestamp = timestamp;
      callback(timestamp);
    });
    activeCallbacks.set(id, { nativeId, callback });
    return id;
  };

  window.cancelAnimationFrame = (id) => {
    queuedCallbacks.delete(id);
    const active = activeCallbacks.get(id);
    if (active) nativeCancelRaf(active.nativeId);
    activeCallbacks.delete(id);
  };

  const getStatus = () => Object.freeze({
    frozen,
    queueSize: queuedCallbacks.size,
    activeNativeRafCount: activeCallbacks.size,
    steppedFrameCount,
    simulatedTimestamp,
    timestampSequence: [...timestampSequence],
  });

  globalThis.__SW_QA_TIME_CONTROLLER__ = {
    freeze() {
      if (frozen) return true;
      frozen = true;
      for (const [id, active] of activeCallbacks) {
        nativeCancelRaf(active.nativeId);
        queuedCallbacks.set(id, active.callback);
      }
      activeCallbacks.clear();
      return true;
    },
    reset(seedOverride = seed) {
      randomState = seedOverride >>> 0;
      steppedFrameCount = 0;
      simulatedTimestamp = 1000.0;
      timestampSequence.length = 0;
    },
    stepFrame(timestamp) {
      frozen = true;
      simulatedTimestamp = timestamp;
      steppedFrameCount += 1;
      timestampSequence.push(timestamp);
      const callbacks = Array.from(queuedCallbacks.values());
      queuedCallbacks.clear();
      for (const callback of callbacks) callback(timestamp);
      return getStatus();
    },
    getStatus,
  };
}

function decodePng(buffer) {
  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = -1;
  let interlace = 0;
  const idatChunks = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    if (type === 'IHDR') {
      width = buffer.readUInt32BE(offset + 8);
      height = buffer.readUInt32BE(offset + 12);
      bitDepth = buffer[offset + 16];
      colorType = buffer[offset + 17];
      interlace = buffer[offset + 20];
    } else if (type === 'IDAT') {
      idatChunks.push(buffer.subarray(offset + 8, offset + 8 + length));
    }
    offset += 12 + length;
  }

  if (!width || !height || idatChunks.length === 0) throw new Error('Invalid PNG capture.');

  // Bytes per pixel comes from the header, it is not a constant. This used to be
  // hardcoded to 4, and Chromium writes screenshots as colour type 2 -- RGB, 3
  // bytes per pixel, no alpha channel. With the wrong stride every row is read
  // from the middle of the previous one and the filter reconstruction predicts
  // from the wrong neighbour, so the decode is not slightly off, it is scrambled:
  // a capture of a brightly lit farmyard came back with 92% of its red channel in
  // the 0-31 bucket and every sampled pixel reading [0, 0, 0, 0].
  //
  // It stayed hidden because both sides of a comparison were scrambled the same
  // way, so identical builds still differenced to 0.0000% and the gate looked
  // healthy. Only an absolute question -- "what colour is this pixel?" -- exposes
  // it, and until now nothing asked one.
  const bytesPerPixel = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  if (bitDepth !== 8 || interlace !== 0 || !bytesPerPixel) {
    throw new Error(
      `Unsupported PNG: bitDepth=${bitDepth} colorType=${colorType} interlace=${interlace}. `
      + 'This decoder handles 8-bit non-interlaced grayscale, RGB, gray+alpha and RGBA.'
    );
  }

  const decompressed = inflateSync(Buffer.concat(idatChunks));
  const stride = width * bytesPerPixel + 1;
  const raw = Buffer.alloc(width * height * bytesPerPixel);

  for (let y = 0; y < height; y += 1) {
    const rowStart = y * stride;
    const filter = decompressed[rowStart];
    const outRowStart = y * width * bytesPerPixel;
    for (let x = 0; x < width * bytesPerPixel; x += 1) {
      const value = decompressed[rowStart + 1 + x];
      const left = x >= bytesPerPixel ? raw[outRowStart + x - bytesPerPixel] : 0;
      const up = y > 0 ? raw[(y - 1) * width * bytesPerPixel + x] : 0;
      const upperLeft = x >= bytesPerPixel && y > 0
        ? raw[(y - 1) * width * bytesPerPixel + x - bytesPerPixel]
        : 0;
      let reconstructed = value;
      if (filter === 1) reconstructed = (value + left) & 0xff;
      else if (filter === 2) reconstructed = (value + up) & 0xff;
      else if (filter === 3) reconstructed = (value + Math.floor((left + up) / 2)) & 0xff;
      else if (filter === 4) {
        const estimate = left + up - upperLeft;
        const distanceLeft = Math.abs(estimate - left);
        const distanceUp = Math.abs(estimate - up);
        const distanceUpperLeft = Math.abs(estimate - upperLeft);
        const predictor = distanceLeft <= distanceUp && distanceLeft <= distanceUpperLeft
          ? left
          : (distanceUp <= distanceUpperLeft ? up : upperLeft);
        reconstructed = (value + predictor) & 0xff;
      }
      raw[outRowStart + x] = reconstructed;
    }
  }

  // Normalised to RGBA so every caller can keep assuming a 4-byte stride.
  const pixels = Buffer.alloc(width * height * 4);
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const source = pixel * bytesPerPixel;
    const target = pixel * 4;
    if (colorType === 0) {
      pixels[target] = pixels[target + 1] = pixels[target + 2] = raw[source];
      pixels[target + 3] = 255;
    } else if (colorType === 4) {
      pixels[target] = pixels[target + 1] = pixels[target + 2] = raw[source];
      pixels[target + 3] = raw[source + 1];
    } else {
      pixels[target] = raw[source];
      pixels[target + 1] = raw[source + 1];
      pixels[target + 2] = raw[source + 2];
      pixels[target + 3] = colorType === 6 ? raw[source + 3] : 255;
    }
  }

  return { width, height, pixels };
}

export { installQaFrameController, decodePng };
