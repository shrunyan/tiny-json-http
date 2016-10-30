var qs = require('querystring')
var http = require('http')
var https = require('https')
var url = require('url')

module.exports = function POST(options, callback) {

  // require options.url or fail noisily 
  if (!options.url) {
    throw Error('options.url required')
  }

  // parse out the options from options.url
  var opts = url.parse(options.url)
  var method = opts.protocol === 'https:'? https.request : http.request

  opts.method = 'POST'
  opts.rejectUnauthorized = false
  opts.agent = false
  opts.headers = options.headers || {}
  opts.headers['User-Agent'] = opts.headers['User-Agent'] || 'tiny-http'
  opts.headers['Content-Type'] = opts.headers['Content-Type'] || 'application/json'
  // opts.headers['Content-Type'] = 'application/x-www-form-urlencoded'
  var reqJSON = opts.headers['Content-Type'] === 'application/json'
  var postData = reqJSON? JSON.stringify(options.data || {}) : qs.stringify(options.data || {})

  // make a POST request
  var req = method(opts, res=> {
   
    var rawData = ''
    var statusCode = res.statusCode
    var contentType = res.headers['content-type']
    var isJSON = contentType === 'application/json'

    if (statusCode !== 200) {
      callback(Error(`GET failed with: ${statusCode}`))
      res.resume()
      return
    }
 
    res.setEncoding('utf8')
    res.on('data', chunk=> rawData += chunk)
    res.on('end', x=> {
      try {
        var parsedData = isJSON? JSON.parse(rawData) : rawData
        callback(null, parsedData)
      } 
      catch (e) {
        callback(e.message)
      }
    })
  })

  req.on('error', e=> callback(Error(e.message)))

  req.write(postData)
 
  req.end()
}