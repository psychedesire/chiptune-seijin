const express = require("express");
const http    = require("http");
const app     = express();

app.use("/", express.static("res"));
app.get("/", (_req, _res) => {
	_res.sendFile("res/index.html", {root: __dirname});
});

const serv = http.createServer(app);
serv.listen(process.env.PORT || 8080);
// serv.listen(8080);

const io = require("socket.io")(serv);
io.on("connection", (_sock) => {
	// new user come, request shares to all user
	_sock.emit("put_id", {id: _sock.id});
	io.emit("request_shares", {});
	// if login clients get "request_shares", client send "relay_share" with them self data.
	_sock.on("relay_share", (_data) => {
		// if clients send "relay_share", send "response_share" to all clients
		io.emit("response_share", _data);
	});
	//
	//
	//
	_sock.on("move"      , (_data) => { io.emit("move"     , _data); });
	_sock.on("pckey_on"  , (_data) => { io.emit("pckey_on" , _data); });
	_sock.on("pckey_off" , (_data) => { io.emit("pckey_off", _data); });
	_sock.on("midi_cc"   , (_data) => { io.emit("midi_cc"  , _data); });
	_sock.on("comment"   , (_data) => { io.emit("comment"  , _data); });
	_sock.on("disconnect", (_data) => { io.emit("remove"   , {id:_sock.id}); });
});