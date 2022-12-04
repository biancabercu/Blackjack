const API_URL = "http://localhost:3000/";
const MIN_BALANCE = 100;
const MAX_BALANCE = 1000;
const ACTIONS_TURN = ["stay", "hit"];
const STEP = { Sit: 0, Deal: 1, Turn: 2, Stand: 3 };

var sessionId = "";
var currentBalance = 0;
var inputValue = "";
var activeStep = 0;
var availableBetOptions = [];

const idInfo = document.getElementById("info");
const idInput = document.getElementById("input");
const idWarning = document.getElementById("warning");
const idAction = document.getElementById("action");
const idStart = document.getElementById("start");
const idDeal = document.getElementById("deal");
const idStand = document.getElementById("stand");

function updateUIAtSIT() {
  idInfo.innerHTML = "";
  idInput.innerHTML = `
 <div>
    <p> Input a balance:</p>
    <input type="number" id="inputValue" name="balance" min="${MIN_BALANCE}" max="${MAX_BALANCE}" />
  </div>`;
  idWarning.innerHTML = "";
  idAction.innerHTML = `
   <button>SIT</button>`;
  idStart.innerHTML = "";
  idDeal.innerHTML = "";
  idStand.innerHTML = "";
}

function updateUIAtDEAL() {
  idInfo.innerHTML = ` 
    <div>
      <h2>Balance: ${currentBalance}</h2>
    </div>`;
  idInput.innerHTML = `
   <div>
      <p> Place your bet: </p>
      <input list="betOptions" id="inputValue" name="bet" />
      <datalist id="betOptions"></datalist>
    </div>`;
  var listBetOptions = document.getElementById("betOptions");
  availableBetOptions.forEach((element) => {
    var option = document.createElement("option");
    option.value = element;
    listBetOptions.appendChild(option);
  });

  idWarning.innerHTML = "";
  idAction.innerHTML = `   
   <button>DEAL</button>`;
  idStart.innerHTML = "";
  idDeal.innerHTML = "";
  idStand.innerHTML = `   
   <button>STAND</button>`;
}

function updateUIAtTURN(res) {
  var winAmount = res.data.winAmount;
  var roundEnded = res.data.roundEnded;

  idInfo.innerHTML = ` 
  <div>
    <h2>Current balance: ${currentBalance}</h2>
    <h3>Win amount: ${winAmount}</h3>
    <h3>Dealer cards:</h3>
    <ul id="cardsDealer"></ul>
    <h3>Your cards:</h3>
    <ul id="cardsPlayer"></ul>
    <h3>Round ended? ${roundEnded} </h3>
  </div>`;

  var dealerCards = res.data.dealerCards;
  if (dealerCards) updateUIListCards("cardsDealer", dealerCards);

  var playerCards = res.data.playerCards;
  if (!playerCards) playerCards = res.data.playerCard;
  if (playerCards) updateUIListCards("cardsPlayer", playerCards);

  idInput.innerHTML = roundEnded
    ? ""
    : `
  <div>
    <p> Choose action: </p>
    <input list="actionOptions" id="inputValue" name="bet" />
    <datalist id="actionOptions"></datalist>
  </div>`;
  if (!roundEnded) {
    var listActionOptions = document.getElementById("actionOptions");
    ACTIONS_TURN.forEach((element) => {
      var option = document.createElement("option");
      option.value = element;
      listActionOptions.appendChild(option);
    });
  }
  idWarning.innerHTML = "";
  idAction.innerHTML = roundEnded ? "" : `<button>TURN</button>`;
  idStart.innerHTML = "";
  idDeal.innerHTML =
    roundEnded && currentBalance > availableBetOptions[0]
      ? `<button>DEAL</button>`
      : "";
  idStand.innerHTML = roundEnded ? `<button>STAND</button>` : "";
}

function updateUIListCards(nameId, arr) {
  var listCards = document.getElementById(nameId);
  if (Array.isArray(arr))
    arr.forEach((element) => {
      let li = document.createElement("li");
      li.innerText = "Rank " + element.rank + "  - Suite " + element.suite;
      listCards.appendChild(li);
    });
  else {
    let li = document.createElement("li");
    li.innerText = "Rank " + arr.rank + "  - Suite " + arr.suite;
    listCards.appendChild(li);
  }
}

function updateUIAtSTAND(res) {
  idInfo.innerHTML = `
    <div>
      <h2>Game ended</h2>
      <h3>Current balance: ${currentBalance}</h3>
      <h3>Rounds played: ${res.data.roundsPlayed} </h3>
      <h3>Win amount: ${res.data.winAmount}</h3>
    </div>`;

  idInput.innerHTML = "";
  idWarning.innerHTML = "";
  idAction.innerHTML = "";
  idStart.innerHTML = `<button>START NEW ROUND</button>`;
  idDeal.innerHTML = "";
  idStand.innerHTML = "";
}

function updateInputValidation() {
  inputValue = document.getElementById("inputValue").value;

  var warningMessage = "";
  if (inputValue == null || inputValue == "")
    warningMessage = "Input value can't be empty";

  //aditional step input validation
  switch (activeStep) {
    case STEP.Sit:
      if (Number(inputValue) < MIN_BALANCE)
        warningMessage =
          "Input value has to be higher than " + MIN_BALANCE + " .";
      if (Number(inputValue) > MAX_BALANCE)
        warningMessage =
          "Input value has to be lower than " + MAX_BALANCE + " .";
      break;
    case STEP.Deal:
      if (Number(inputValue) > currentBalance)
        warningMessage =
          "Input value has to be lower than your current balance";
      break;
    default:
      break;
  }

  idWarning.innerHTML = warningMessage;

  return warningMessage == "";
}

function requestGET(pathURL, paramsURL) {
  axios
    .get(API_URL + pathURL + paramsURL)
    .then((res) => {
      console.log(res);
      updateUI(res);
    })
    .catch((err) => console.error(err));
}

function requestPOST(pathURL, body) {
  axios
    .post(API_URL + pathURL, body)
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
}

function requestAction() {
  if (activeStep != STEP.Stand) {
    var hasValidInput = updateInputValidation();
    if (!hasValidInput) return;
  }

  switch (activeStep) {
    case STEP.Sit:
      requestGET("sit/", "?balance=" + inputValue);
      break;
    case STEP.Deal:
      requestGET("deal/", "?bet=" + inputValue + "&sessionId=" + sessionId);
      break;
    case STEP.Turn:
      requestGET("turn/", "?action=" + inputValue + "&sessionId=" + sessionId);
      break;
    case STEP.Stand:
      requestGET("stand/", "?sessionId=" + sessionId);
    default:
      break;
  }
}

function updateUI(res) {
  if (activeStep != STEP.Stand) activeStep += 1;

  //looping at TURN step if the game is not ended & the final rounds aren't yet shown
  if (activeStep == STEP.Stand)
    if (typeof res.data.roundsPlayed === "undefined") activeStep = STEP.Turn;

  switch (activeStep) {
    case STEP.Sit:
      updateUIAtSIT();
      break;
    case STEP.Deal:
      //update data first from prev step
      currentBalance = inputValue;
      sessionId = res.data.sessionId;
      availableBetOptions = res.data.availableBetOptions;
      updateUIAtDEAL();
      break;
    case STEP.Turn:
      //update data first from prev step
      currentBalance = res.data.currentBalance;
      updateUIAtTURN(res);
      break;
    case STEP.Stand:
      updateUIAtSTAND(res);
    default:
      break;
  }
}

// window.onload = function () {
//   initReferencedIds();
// };

document.getElementById("start").addEventListener("click", () => {
  activeStep = -1;
  inputValue = "";
  currentBalance = 0;
  updateUI();
});
document.getElementById("action").addEventListener("click", () => {
  requestAction();
});
document.getElementById("stand").addEventListener("click", () => {
  activeStep = STEP.Stand;
  requestAction();
});
document.getElementById("deal").addEventListener("click", () => {
  activeStep = STEP.Deal;
  updateUIAtDEAL();
});
