const express = require("express");
const http    = require("http");
const app     = express();

app.use("/", express.static("res"));
app.get("/", (_req, _res) => {
	_res.sendFile("res/index.html", {root: __dirname});
});
const serv = http.createServer(app);
serv.listen(process.env.PORT || 8080);