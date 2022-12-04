const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());

const api_url = "https://blackjack.fuzz.me.uk";

const options = {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ balance: "100" }),
};

app.get("/", async (req, res) => {
  const response = await fetch(api_url + "/sit/", options);
  res.json(await response.json());
});

//
app.get("/sit/", async (req, res) => {
  let money = req.query.balance;
  console.log("/sit/ with balance:" + money);

  const response = await fetch(api_url + "/sit/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ balance: money }),
  });
  res.json(await response.json());
});

app.get("/deal/", async (req, res) => {
  let bet = req.query.bet;
  let sessionId = req.query.sessionId;
  console.log("/deal/ with bet:" + bet + " and sessionid:" + sessionId);

  const response = await fetch(api_url + "/deal/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bet: bet, sessionId: sessionId }),
  });
  res.json(await response.json());
});

app.get("/turn/", async (req, res) => {
  let action = req.query.action;
  let sessionId = req.query.sessionId;
  console.log("/turn/ with action:" + action + " and sessionid:" + sessionId);

  const response = await fetch(api_url + "/turn/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: action, sessionId: sessionId }),
  });
  res.json(await response.json());
});

app.get("/stand/", async (req, res) => {
  let sessionId = req.query.sessionId;
  console.log("/stand/ with sessionid:" + sessionId);

  const response = await fetch(api_url + "/stand/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: sessionId }),
  });
  res.json(await response.json());
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
