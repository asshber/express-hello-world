var express = require('express')
var { exec } = require('child_process')

var app = express()
app.use(express.json())

app.get('/', function (req, res) {
  res.send('Hello World!!')
})

// Run a command like: GET /cmd?cmd=ls%20-la
// Or: POST /cmd  { "cmd": "ls -la" }
app.all('/cmd', function (req, res) {
  var cmd = (req.query && req.query.cmd) || (req.body && req.body.cmd)

  if (!cmd || typeof cmd !== 'string') {
    return res.status(400).json({ error: 'Missing cmd. Use ?cmd=... or JSON body { "cmd": "..." }' })
  }

  exec(
    cmd,
    {
      timeout: 30_000,
      maxBuffer: 10 * 1024 * 1024, // 10MB
      windowsHide: true
    },
    function (error, stdout, stderr) {
      res.status(error ? 500 : 200).json({
        cmd: cmd,
        ok: !error,
        exitCode: error && typeof error.code === 'number' ? error.code : 0,
        stdout: stdout,
        stderr: stderr,
        error: error ? (error.message || String(error)) : null
      })
    }
  )
})

app.listen(3000, function () {
  console.log('Listening on port 3000...')
})
