var net = require('net');
var WebSocket = require('ws');
var blessed = require('blessed');

var screen = blessed.screen();

var logbox = blessed.box({  
  fg: 'lime',
  bg: 'default',
  border: {
    type: 'line',
    fg: '#ffffff'
  },
  tags: true,
  width: '50%',
  height: '100%',
  scrollable: true,
});

var rxbox = blessed.box({
  fg: 'lime',
  bg: 'default',
  width: '30%',
  height: '150',
  right: '0',
  top: '90%',
});

var txbox = blessed.box({
  fg: 'lime',
  bg: 'default',
  width: '30%',
  height: '150',
  right: '0',
  top: '80%',
});

screen.append(logbox);
screen.append(rxbox);
screen.append(txbox);

var bytestx = 0;
var bytesrx = 0;

var server = net.createServer(function(c) {
  var ws = new WebSocket('ws://p.sudo.im:8080', { protocol: 'tunnel-protocol'});
  ws.on('open', function() {
    c.on('data', function(data) {
      logbox.insertTop("[ |>] "+data.length+" bytes");
      bytestx += data.length;
      try {
      ws.send(data);
      } catch(e) { }
    });
    c.on('close', function() {
      ws.close();
    });
    c.on('error', function(e) {
    }); 
    ws.on('message', function(message) {
      logbox.insertTop("[<| ] "+message.length+" bytes");
      bytesrx += message.length;
      c.write(message);
    });
    ws.on('error', function(e) {
    });
    ws.on('close', function(e, m) {
     c.end();
    });
  });
});
server.listen(8080, function() {
  logbox.pushLine("Listening for connections on port 8080.");
});

function round_float(x,n){
  if(!parseInt(n))
  	var n=0;
  if(!parseFloat(x))
  	return false;
  return Math.round(x*Math.pow(10,n))/Math.pow(10,n);
}


setInterval(function() {
  rxbox.setContent("Rx: "+round_float(bytesrx/1024/1024, 2)+" MB");
  txbox.setContent("Tx: "+round_float(bytestx/1024/1024, 2)+" MB");
  screen.render();
}, 500);

screen.render();
