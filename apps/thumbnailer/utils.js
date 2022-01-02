const { Canvas } = require('skia-canvas')
const { Image } = require('image-js')
const cannyEdgeDetector = require('canny-edge-detector')


exports.roundedPath = (ctx, x, y, width, height, radius) => {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

exports.getColorBrightness = (rgb) => {
  return Math.sqrt(
    /* r */ 0.299 * (rgb[0] * rgb[0]) +
    /* g */ 0.587 * (rgb[1] * rgb[1]) +
    /* b */ 0.114 * (rgb[2] * rgb[2])
  )
}

exports.findComplementingColor = (palette, bright) => {
  let color = [ 0, 0, 0 ]
  let colorBrightness = bright ? 255 : 0
  for (let i = 0; i < palette.length; i++) {
    const iBrightness = exports.getColorBrightness(palette[i])
    if (bright && (iBrightness < colorBrightness)
      || !bright && (iBrightness > colorBrightness)) {
        color = palette[i]
        colorBrightness = iBrightness
    }
  }

  return color
}

exports.tintWatermark = (buffer, color) => {
  const canvas = new Canvas(buffer.width, buffer.height)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(buffer, 0, 0, buffer.width, buffer.height)

  const imgData = ctx.getImageData(0, 0, buffer.width, buffer.height)
  const pixels = imgData.data
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i+0] = color[0]
    pixels[i+1] = color[1]
    pixels[i+2] = color[2]
  }
  ctx.putImageData(imgData, 0, 0)

  return canvas
}

exports.rgbToHsl = (rgb) => {
  const r = rgb[0] / 255
  const g = rgb[1] / 255
  const b = rgb[2] / 255

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, l ];
}

exports.findLeastNoisyCorner = async (buffer, boxX, boxY, boxWidth, boxHeight, width, height, padding = 0) => {
  const img = await Image.load(buffer)
  const grey = img.grey()
  const edges = cannyEdgeDetector(grey)
  let pos = 'bl'
  let value = 55555
  let brightness = 0

  for (const corner of [ 'bl', 'br', 'tl', 'tr' ]) {
    let originX = boxX
    let originY = boxY

    if (corner.startsWith('t')) originY += padding
    else originY += boxHeight - padding - height

    if (corner.endsWith('l')) originX += padding
    else originX += boxWidth - padding - width

    let currVal = 0
    let currBrightness = 0
    let currBrightnessPoints = 0
    for (let xi = originX; xi < width + originX; xi++) {
      for (let yi = originY; yi < height + originY; yi++) {
        const index = xi + yi*img.width
        currVal += edges.data[index]

        if (xi % 4 === 0 && yi % 4 == 0) {
          const pixels = [ img.data[index*4], img.data[index*4+1], img.data[index*4+2] ]
          currBrightness += exports.rgbToHsl(pixels)[2] * 255
          currBrightnessPoints++
        }
      }
    }

    // prioritize lower corners
    if (corner.startsWith('b'))
      currVal *= 0.8

    if (currVal < value) {
      value = currVal
      pos = corner
      brightness = ~~(currBrightness / currBrightnessPoints)
    }
  }

  return [ pos, brightness, edges.toDataURL() ]
}
