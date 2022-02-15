const express = require("express");
const cors = require("cors");
const http = require("http");

const config = require("./config/app");
const router = require("./routes");
const SocketServer = require("./socket");

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/uploads"));

app.use(router);

const port = config.appPort;
SocketServer(server);

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
