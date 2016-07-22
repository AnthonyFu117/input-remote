/*
* @Author: Anthony
* @Date:   2016-03-20 08:09:17
* @Last Modified by:   Anthony
* @Last Modified time: 2016-04-08 19:57:03
*/

'use strict';

var WSClient = function(url,channel_id,auth,debug)
{
  var wsc = this;
  wsc.channel_id = channel_id;
  wsc.connected = false;
  wsc.online = false;
  wsc.auth = false;
  wsc.url = url;
  wsc.debug = debug;

  wsc.connect = function()
  {
    wsc.ws = new WebSocket(wsc.url);
    wsc.ws.onopen = function() {
      wsc.connected = true;
      if (wsc.onopen)
        wsc.onopen();
      if (wsc.debug)
        console.log('[Sender] Connection established: ',wsc.channel_id);
    };
    wsc.ws.onclose = function() {
      wsc.connected = false;
      if (wsc.onclose)
        wsc.onclose();
      if (wsc.debug)
        console.log('[Sender] Connection lost: ',wsc.channel_id);
      wsc.ws = undefined;
      wsc.connected = false;
    };
    wsc.ws.onmessage = function (evt) {
      var data = JSON.parse(evt.data);
      if (wsc.debug)
        console.log('[Sender] Received: ', data);

      if (data.action == "system")
      {
        if (data.subaction == "peerstate")
        {
          wsc.online = data.data.state;
          if (wsc.onstatechange)
            wsc.onstatechange(wsc.online);
        }
      }
      else if (data.action == "key")
      {
        wsc.onkey(data.data);
      }
    };
  }
  wsc.disconnect = function()
  {
    if (wsc.ws == undefined) return;
    wsc.ws.close();
    wsc.ws = undefined;
    wsc.connected = false;
    wsc.onstatechange(false);
  }
  wsc.sendkey = function(obj)
  {
    if (wsc.ws == undefined) return;
    wsc.ws.send(JSON.stringify(obj));
  }
  return wsc;
};
