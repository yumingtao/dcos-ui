import http from "http";
import Rx from "rxjs/Rx";
import requestTemplate from "./constants/MesosOperatorRequest";

const stream = new Rx.ReplaySubject();
let cache = "";
let messageLength = 0;

function readMessageAndResetHead() {
  const event = JSON.parse(cache.substring(0, messageLength));
  cache = cache.substring(messageLength, cache.length);
  messageLength = 0;
  console.log(event);
  stream.next(event);
}

function getNextMessageLength() {
  let messageLengthPosition = cache.indexOf("\n");
  if (messageLengthPosition === -1) {
    messageLengthPosition = cache.indexOf("\r\n");
  }
  if (messageLengthPosition !== -1) {
    messageLength = parseInt(cache.substring(0, messageLengthPosition), 10);
    cache = cache.substring(messageLengthPosition + 1, cache.length);
  }
}

function parseResponse(chunk) {
  cache += chunk.toString();
  if (messageLength === 0) {
    getNextMessageLength();
  }
  if (messageLength > 0 && cache.length >= messageLength) {
    readMessageAndResetHead();
  }
}

function connect() {
  const req = http.request(requestTemplate, function(res) {
    res.setEncoding("utf8");

    cache = "";
    messageLength = 0;

    res.on("data", function(chunk) {
      parseResponse(chunk);
    });
  });

  req.on("error", function(error) {
    console.error(`problem with request:`, error);
  });

  req.write(
    JSON.stringify({
      type: "SUBSCRIBE"
    })
  );

  req.end();
}

connect();

module.exports = { stream };
