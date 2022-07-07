const { Canvas, loadImage, FontLibrary } = require('skia-canvas')
const ColorThief = require('colorthief')
const { roundedPath, findLeastNoisyCorner, tintWatermark, findComplementingColor } = require('./utils.js')

FontLibrary.use('defaultFont', [ './res/font.ttf' ])

const TAG_HEIGHT = 27
const IMG_BORDER_RADIUS = 5
const ELEMENT_MARGIN = 5
const WATERMARK_PADDING = 6


exports.generateImage = async (body) => {
  if (!body)
    throw { status: 400, message: 'invalid body' }

  const data = body.data || {}
  const options = body.options || {}

  if (!data.thumbnail)
    throw { status: 400, message: 'missing thumbnail' }

  const props = {
    additionalHeight: 0,
    additionalWidth: 0,
    originOffsetX: 0,
    originOffsetY: 0,
    jobs: [],
    palette: []
  }

  const renderTags = options.tags || options.full
  const renderWatermark = options.watermark || options.full

  if (renderTags && data.tags && data.tags.length) {
    props.additionalHeight += TAG_HEIGHT + ELEMENT_MARGIN
    props.originOffsetY += TAG_HEIGHT + ELEMENT_MARGIN
    props.jobs.push(drawTags)
  }

  if (renderWatermark) {
    props.jobs.push(drawWatermark)
  }

  const imgbuffer = await loadImage(data.thumbnail)
  const imgscale = 460 / imgbuffer.width
  const canvas = new Canvas(~~(imgbuffer.width * imgscale) + props.additionalWidth, ~~(imgbuffer.height * imgscale) + props.additionalHeight)
  const ctx = canvas.getContext('2d')
  const imgdimensions = [ props.originOffsetX, props.originOffsetY, ~~(imgbuffer.width * imgscale), ~~(imgbuffer.height * imgscale) ]
  props.imgdimensions = imgdimensions
  props.canvas = canvas

  try {
    props.palette = await ColorThief.getPalette(data.thumbnail)
  } catch (ex) { }

  ctx.save();
  roundedPath(ctx, ...imgdimensions, IMG_BORDER_RADIUS);
  ctx.clip();
  ctx.drawImage(imgbuffer, ...imgdimensions)
  ctx.restore();

  for (const job of props.jobs)
    await job(ctx, props, data, options)

  const buffer = await canvas.toBuffer('image/png', { compressionLevel: 3 })
  return Buffer.from(buffer, 'binary').toString('base64')
}

function drawTags(ctx, props, data, options) {
  let cursor = 0
  const CIRCLE_RAD = TAG_HEIGHT / 5 * 2
  const FONT_HEIGHT = TAG_HEIGHT - ELEMENT_MARGIN * 3
  const INNER_MARGIN = (TAG_HEIGHT - FONT_HEIGHT) / 2
  ctx.font = `${FONT_HEIGHT}px defaultFont`

  let tag = (name) => {
    const { width } = ctx.measureText(name)
    const tagBackground = [ cursor, 0, width + INNER_MARGIN * 2 + ELEMENT_MARGIN + CIRCLE_RAD, TAG_HEIGHT ]
    if (tagBackground[0] + tagBackground[2] > ctx.canvas.width) return

    roundedPath(ctx, ...tagBackground, IMG_BORDER_RADIUS)
    ctx.fillStyle = '#202225'
    ctx.fill()

    ctx.beginPath()
    ctx.arc(cursor + INNER_MARGIN + CIRCLE_RAD / 2, TAG_HEIGHT / 2, CIRCLE_RAD / 2, 0, 2 * Math.PI, false)
    ctx.closePath()
    const hue = [...name].reduce((prev, curr) => prev + curr.charCodeAt(0), 0)
    ctx.fillStyle = `hsl(${~~hue % 360}, 40%, 60%)`
    ctx.fill()

    ctx.fillStyle = '#dddddd'
    ctx.fillText(name, cursor + INNER_MARGIN + CIRCLE_RAD + ELEMENT_MARGIN, TAG_HEIGHT - (TAG_HEIGHT - FONT_HEIGHT) / 5 * 3)
    cursor += tagBackground[2] + ELEMENT_MARGIN
  }
  data.tags.map(t => t.toUpperCase()).forEach(tag)
}

async function drawWatermark(ctx, props, data, options) {
  const buff = await loadImage('./res/watermark.png')
  const height = 16
  const width = buff.width * (height / buff.height)

  let x = props.imgdimensions[0]
  let y = props.imgdimensions[1]

  // topleft TL, topright TR, bottomleft BL, bottomright BR
  const canvBuff = await props.canvas.toBuffer()
  const cornerData = await findLeastNoisyCorner(canvBuff, x, y, props.imgdimensions[2], props.imgdimensions[3], width, height, WATERMARK_PADDING)
  const position = (typeof options.watermark === 'string')
    ? options.watermark.toLowerCase()
    : cornerData[0]

  if (position.startsWith('t')) y += WATERMARK_PADDING
  else y += props.imgdimensions[3] - WATERMARK_PADDING - height

  if (position.endsWith('l')) x += WATERMARK_PADDING
  else x += props.imgdimensions[2] - WATERMARK_PADDING - width

  const watermarkColor = findComplementingColor(props.palette, cornerData[1] > 170)
  const tinted = tintWatermark(buff, watermarkColor)
  ctx.drawImage(tinted, x, y, width, height)
}
