'use strict';

const MIN_RED = 0;
const MAX_RED = 255;
const MIN_GREEN = 0;
const MAX_GREEN = 255;
const MIN_BLUE = 0;
const MAX_BLUE = 255;
const MIN_ALPHA = 0;
const MAX_ALPHA = 255;

function composeRGB(red, green, blue) {
  return [
    Math.max(MIN_RED, Math.min(MAX_RED, red)),
    Math.max(MIN_GREEN, Math.min(MAX_GREEN, green)),
    Math.max(MIN_BLUE, Math.min(MAX_BLUE, blue)),
  ]
}

function composeRGBA(red, green, blue, alpha) {
  return [
    Math.max(MIN_RED, Math.min(MAX_RED, red)),
    Math.max(MIN_GREEN, Math.min(MAX_GREEN, green)),
    Math.max(MIN_BLUE, Math.min(MAX_BLUE, blue)),
    Math.max(MIN_ALPHA, Math.min(MAX_ALPHA, alpha)),
  ]
}

// https://github.com/antimatter15/rgb-lab/blob/master/color.js
function rgbToLab(red, green, blue) {
  let r = red / 255,
      g = green / 255,
      b = blue / 255,
      x,
      y,
      z;

  r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
  y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
  z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

  return [
    (116 * y) - 16,
    500 * (x - y),
    200 * (y - z)
  ]
}

// https://github.com/antimatter15/rgb-lab/blob/master/color.js
function labToRgb(lightness, aChannel, bChannel) {
  let y = (lightness + 16) / 116,
      x = aChannel / 500 + y,
      z = y - bChannel / 200,
      r, g, b;

  x = 0.95047 * ((x * x * x > 0.008856) ? x * x * x : (x - 16/116) / 7.787);
  y = 1.00000 * ((y * y * y > 0.008856) ? y * y * y : (y - 16/116) / 7.787);
  z = 1.08883 * ((z * z * z > 0.008856) ? z * z * z : (z - 16/116) / 7.787);

  r = x *  3.2406 + y * -1.5372 + z * -0.4986;
  g = x * -0.9689 + y *  1.8758 + z *  0.0415;
  b = x *  0.0557 + y * -0.2040 + z *  1.0570;

  r = (r > 0.0031308) ? (1.055 * Math.pow(r, 1/2.4) - 0.055) : 12.92 * r;
  g = (g > 0.0031308) ? (1.055 * Math.pow(g, 1/2.4) - 0.055) : 12.92 * g;
  b = (b > 0.0031308) ? (1.055 * Math.pow(b, 1/2.4) - 0.055) : 12.92 * b;

  return [
    Math.max(0, Math.min(1, r)) * 255,
    Math.max(0, Math.min(1, g)) * 255,
    Math.max(0, Math.min(1, b)) * 255
  ]
}

// https://github.com/antimatter15/rgb-lab/blob/master/color.js
function deltaE(labA, labB){
  let deltaL = labA[0] - labB[0];
  let deltaA = labA[1] - labB[1];
  let deltaB = labA[2] - labB[2];
  let c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
  let c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
  let deltaC = c1 - c2;
  let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
  deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
  let sc = 1.0 + 0.045 * c1;
  let sh = 1.0 + 0.015 * c1;
  let deltaLKlsl = deltaL / (1.0);
  let deltaCkcsc = deltaC / (sc);
  let deltaHkhsh = deltaH / (sh);
  let i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
  return i < 0 ? 0 : Math.sqrt(i);
}

function compareRGB(rgbA, rgbB) {
  const labA = rgbToLab(rgbA[0], rgbA[1], rgbA[2]);
  const labB = rgbToLab(rgbB[0], rgbB[1], rgbB[2]);
  return deltaE(labA, labB);
}

function compareImageData(imageDataA, imageDataB) {
  
}

function setGrayscale(imageData) {
  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    // const a = imageData[i + 3];

    // https://en.wikipedia.org/wiki/Grayscale
    const avg = (0.299 * r + 0.587 * g + 0.114 * b) / 3;
    imageData[i] = avg;
    imageData[i+1] = avg;
    imageData[i+2] = avg;
    // imageData[i+3] = a;
  }
  return imageData;
}

function setGaussian(imageData) {
  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const a = imageData[i + 3];
  }
}

function applyGaussianKernel(input, sigma) {
  const kernelSize = Math.ceil(sigma * 3) * 2 + 1;
  const kernel = new Array(kernelSize);

  const sigmaSquared = sigma * sigma;
  const coefficient = 1 / (Math.sqrt(2 * Math.PI) * sigma);

  let sum = 0;
  for (let i = 0; i < kernelSize; i++) {
    const x = i - Math.floor(kernelSize / 2);
    const exponent = -(x * x) / (2 * sigmaSquared);
    kernel[i] = coefficient * Math.exp(exponent);
    sum += kernel[i];
  }

  // Normalize the kernel
  for (let i = 0; i < kernelSize; i++) {
    kernel[i] /= sum;
  }

  const result = new Array(input.length);

  // Convolve the input array with the kernel
  for (let i = 0; i < input.length; i++) {
    let convolution = 0;
    for (let j = 0; j < kernelSize; j++) {
      const index = Math.max(0, Math.min(input.length - 1, i + j - Math.floor(kernelSize / 2)));
      convolution += input[index] * kernel[j];
    }
    result[i] = convolution;
  }

  return result;
}

export default {
  compare: compareRGB,
  grayscale: setGrayscale,
  greyscale: setGrayscale,
}