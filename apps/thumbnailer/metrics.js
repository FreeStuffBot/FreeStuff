const client = require('prom-client')
const Registry = client.Registry
const register = new Registry()

// client.collectDefaultMetrics({ register })

const counterRequests = new client.Counter({
  name: 'thumbnailer_total_requests',
  help: 'Keeps track of the total amount of incoming requests',
  labelNames: [ 'gameid', 'tracker' ]
});
register.registerMetric(counterRequests)

const gaugeCachedImages = new client.Gauge({
  name: 'thumbnailer_cached_images',
  help: 'Shows the current amount of cached images'
});
register.registerMetric(gaugeCachedImages)
gaugeCachedImages.reset()

module.exports.endpoint = async (req, res) => {
  const auth = req.params.auth
  if (!auth) return res.status(400).end()
  if (auth !== process.env.METRICS_AUTH) return res.status(401).send('')

  res
    .status(200)
    .header({ 'Content-Type': 'text/plain' })
    .send(await register.metrics())
}

module.exports.tracker = {
  counterRequests,
  gaugeCachedImages
}
