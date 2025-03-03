 
 var deck = [];
 var playerCards = [];
 var dealerCards = [];
 var hiddenCard = null; 
 var gameOver = false;
 var playerTurn = true;
 var result = "";

 
 function createDeck() {
   const suits = ['♥', '♦', '♣', '♠'];
   const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
   let newDeck = [];
   for (let suit of suits) {
     for (let value of values) {
       let cardValue = 0;
       if (value === 'A') {
         cardValue = 11;
       } else if (['J', 'Q', 'K'].includes(value)) {
         cardValue = 10;
       } else {
         cardValue = parseInt(value);
       }
       newDeck.push({ value, suit, points: cardValue });
     }
   }
   return newDeck;
 }

 
 function shuffleDeck(array) {
   for (let i = array.length - 1; i > 0; i--) {
     const j = Math.floor(Math.random() * (i + 1));
     [array[i], array[j]] = [array[j], array[i]];
   }
   return array;
 }

 
 function calculateSum(cards) {
   let sum = 0;
   let aces = 0;
   cards.forEach(card => {
     sum += card.points;
     if (card.value === 'A') aces++;
   });
   
   while (sum > 21 && aces > 0) {
     sum -= 10;
     aces--;
   }
   return sum;
 }

 
 function drawCard() {
   return deck.pop();
 }


 function newGame() {
   deck = shuffleDeck(createDeck());
   playerCards = [];
   dealerCards = [];
   hiddenCard = null;
   gameOver = false;
   playerTurn = true;
   result = "";

   
   playerCards.push(drawCard());
   playerCards.push(drawCard());
   dealerCards.push(drawCard());
   hiddenCard = drawCard(); 

   updateUI();
   saveGame();
   document.getElementById('resultado').textContent = "";
   document.getElementById('btnPedir').disabled = false;
   document.getElementById('btnPlantarse').disabled = false;
   document.getElementById('btnNueva').style.display = "none";
 }

 
 function updateUI() {
   const playerCardsDiv = document.getElementById('playerCards');
   const dealerCardsDiv = document.getElementById('dealerCards');
   playerCardsDiv.innerHTML = "";
   dealerCardsDiv.innerHTML = "";

   
   playerCards.forEach(card => {
     const cardDiv = document.createElement('div');
     cardDiv.className = "card";
     cardDiv.textContent = card.value + " "+ card.suit;
     playerCardsDiv.appendChild(cardDiv);
   });
   document.getElementById('playerSum').textContent = calculateSum(playerCards);

   
   if (!gameOver && playerTurn) {
    dealerCards.forEach(card => {
      const cardDiv = document.createElement('div');
      cardDiv.className = "card";
      cardDiv.textContent = card.value + card.suit;
      dealerCardsDiv.appendChild(cardDiv);
    });
   
     const hiddenDiv = document.createElement('div');
     hiddenDiv.className = "card";
     hiddenDiv.textContent = "?";
     dealerCardsDiv.appendChild(hiddenDiv);
     
     document.getElementById('dealerSum').textContent = calculateSum(dealerCards);
   } else {
     
     dealerCards.forEach(card => {
       const cardDiv = document.createElement('div');
       cardDiv.className = "card";
       cardDiv.textContent = card.value + card.suit;
       dealerCardsDiv.appendChild(cardDiv);
     });
     if (hiddenCard) {
       const cardDiv = document.createElement('div');
       cardDiv.className = "card";
       cardDiv.textContent = hiddenCard.value + hiddenCard.suit;
       dealerCardsDiv.appendChild(cardDiv);
     }
     // Mostrar la suma total del dealer (incluyendo la carta oculta)
     let dealerTotal = calculateSum(dealerCards);
     if (hiddenCard) dealerTotal += calculateSum([hiddenCard]);
     document.getElementById('dealerSum').textContent = dealerTotal;
   }
 }

 // Guardar el estado del juego en localStorage
 function saveGame() {
   const gameState = {
     deck,
     playerCards,
     dealerCards,
     hiddenCard,
     gameOver,
     playerTurn,
     result
   };
   localStorage.setItem("blackjackGame", JSON.stringify(gameState));
 }

 // Cargar el estado del juego desde localStorage
 function loadGame() {
   const savedState = localStorage.getItem("blackjackGame");
   if (savedState) {
     const state = JSON.parse(savedState);
     deck = state.deck;
     playerCards = state.playerCards;
     dealerCards = state.dealerCards;
     hiddenCard = state.hiddenCard;
     gameOver = state.gameOver;
     playerTurn = state.playerTurn;
     result = state.result;
     updateUI();
     document.getElementById('resultado').textContent = result;
     // Si la partida terminó, habilitamos el botón de nueva partida y deshabilitamos las opciones
     if (gameOver) {
       document.getElementById('btnPedir').disabled = true;
       document.getElementById('btnPlantarse').disabled = true;
       document.getElementById('btnNueva').style.display = "inline-block";
     }
   } else {
     newGame();
   }
 }

 // Función para la jugada del dealer (una vez que el jugador se planta)
 function dealerTurn() {
   // Revelar la carta oculta
   dealerCards.push(hiddenCard);
   hiddenCard = null;
   updateUI();

   // El dealer sigue pidiendo cartas mientras su suma sea menor a 17
   while (calculateSum(dealerCards) < 17) {
     dealerCards.push(drawCard());
   }
   finishGame();
 }

 // Determinar el resultado de la partida y finalizar el juego
 function finishGame() {
   const playerTotal = calculateSum(playerCards);
   const dealerTotal = calculateSum(dealerCards);

   if (playerTotal > 21) {
     result = "Te pasaste, perdiste.";
   } 
   else if (dealerTotal > 21) {
     result = "Dealer se pasó, ¡ganaste!";
   }
   else if (dealerTotal === playerTotal) {
     result = "Empate.";
   } 
   else if (playerTotal > dealerTotal) {
     result = "¡Ganaste!";
   } 
   else {
     result = "Perdiste.";
   }
   gameOver = true;
   playerTurn = false;
   updateUI();
   document.getElementById('resultado').textContent = result;
   document.getElementById('btnPedir').disabled = true;
   document.getElementById('btnPlantarse').disabled = true;
   document.getElementById('btnNueva').style.display = "inline-block";
   saveGame();
 }

 // Eventos de los botones
 document.getElementById('btnPedir').addEventListener('click', function() {
   if (!gameOver && playerTurn) {
     playerCards.push(drawCard());
     if (calculateSum(playerCards) > 21) {
       // Si el jugador se pasa, termina la partida y se revela la carta oculta
       gameOver = true;
       result = "Te pasaste, perdiste.";
       // Revelamos la carta oculta para mostrar la mano completa del dealer
       dealerCards.push(hiddenCard);
       hiddenCard = null;
       document.getElementById('resultado').textContent = result;
       document.getElementById('btnPedir').disabled = true;
       document.getElementById('btnPlantarse').disabled = true;
       document.getElementById('btnNueva').style.display = "inline-block";
     }
     else if(calculateSum(playerCards)==21){
      playerTurn = false;
      dealerTurn();
      saveGame();
     }
     updateUI();
     saveGame();
   }
 });

 document.getElementById('btnPlantarse').addEventListener('click', function() {
   if (!gameOver && playerTurn) {
     playerTurn = false;
     dealerTurn();
     saveGame();
   }
 });

 document.getElementById('btnNueva').addEventListener('click', function() {
   newGame();
   if(calculateSum(playerCards)==21){
    hiddenCard = null;
    const playerTotal = calculateSum(playerCards);
    const dealerTotal = calculateSum(dealerCards);
    if (dealerTotal === playerTotal) {
      result = "Empate.";
    }
    else {
      result = "¡BlackJack Perfecto, Ganaste!";
    }
    gameOver = true;
    playerTurn = false;
    updateUI();
    document.getElementById('resultado').textContent = result;
    document.getElementById('btnPedir').disabled = true;
    document.getElementById('btnPlantarse').disabled = true;
    document.getElementById('btnNueva').style.display = "inline-block";
   }
   saveGame();
 });

 // Al cargar la página, se intenta cargar el estado guardado o se inicia una nueva partida
 document.addEventListener('DOMContentLoaded', function() {
   loadGame();
 });