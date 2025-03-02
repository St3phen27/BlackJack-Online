 // Variables globales del juego
 var deck = [];
 var playerCards = [];
 var dealerCards = [];
 var hiddenCard = null; // Carta oculta del dealer
 var gameOver = false;
 var playerTurn = true;
 var result = "";

 // Función para crear la baraja
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

 // Función para barajar la baraja
 function shuffleDeck(array) {
   for (let i = array.length - 1; i > 0; i--) {
     const j = Math.floor(Math.random() * (i + 1));
     [array[i], array[j]] = [array[j], array[i]];
   }
   return array;
 }

 // Función para calcular la suma de puntos de un conjunto de cartas (considera Aces como 1 si es necesario)
 function calculateSum(cards) {
   let sum = 0;
   let aces = 0;
   cards.forEach(card => {
     sum += card.points;
     if (card.value === 'A') aces++;
   });
   // Si la suma supera 21 y hay Ases, restar 10 por cada uno según sea necesario
   while (sum > 21 && aces > 0) {
     sum -= 10;
     aces--;
   }
   return sum;
 }

 // Función para sacar una carta de la baraja
 function drawCard() {
   return deck.pop();
 }

 // Función para inicializar una nueva partida
 function newGame() {
   deck = shuffleDeck(createDeck());
   playerCards = [];
   dealerCards = [];
   hiddenCard = null;
   gameOver = false;
   playerTurn = true;
   result = "";

   // Repartir cartas iniciales
   playerCards.push(drawCard());
   playerCards.push(drawCard());
   dealerCards.push(drawCard());
   hiddenCard = drawCard(); // Esta carta se mantendrá oculta hasta que el jugador se plante

   updateUI();
   saveGame();
   document.getElementById('resultado').textContent = "";
   document.getElementById('btnPedir').disabled = false;
   document.getElementById('btnPlantarse').disabled = false;
   document.getElementById('btnNueva').style.display = "none";
 }

 // Función para actualizar la interfaz
 function updateUI() {
   const playerCardsDiv = document.getElementById('playerCards');
   const dealerCardsDiv = document.getElementById('dealerCards');
   playerCardsDiv.innerHTML = "";
   dealerCardsDiv.innerHTML = "";

   // Mostrar cartas del jugador
   playerCards.forEach(card => {
     const cardDiv = document.createElement('div');
     cardDiv.className = "card";
     cardDiv.textContent = card.value + " "+ card.suit;
     playerCardsDiv.appendChild(cardDiv);
   });
   document.getElementById('playerSum').textContent = calculateSum(playerCards);

   // Mostrar cartas del dealer
   // Si el juego aún no terminó, se muestra la carta visible y una carta oculta
   if (!gameOver && playerTurn) {
    dealerCards.forEach(card => {
      const cardDiv = document.createElement('div');
      cardDiv.className = "card";
      cardDiv.textContent = card.value + card.suit;
      dealerCardsDiv.appendChild(cardDiv);
    });
     // Carta oculta
     const hiddenDiv = document.createElement('div');
     hiddenDiv.className = "card";
     hiddenDiv.textContent = "?";
     dealerCardsDiv.appendChild(hiddenDiv);
     // Suma solo con las cartas visibles
     document.getElementById('dealerSum').textContent = calculateSum(dealerCards);
   } else {
     // Si el juego terminó o el jugador se plantó, se revelan todas las cartas
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