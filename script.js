
const menu_screen = document.getElementById("menu_screen");
const size_buttons = menu_screen.querySelector("#size_buttons");
const check_timer = menu_screen.querySelector("#check_timer");
const show_pairs = menu_screen.querySelector(".show_pairs");
const Game_Container = document.getElementById("Game_Container");
const GameBoard = Game_Container.querySelector("#GameBoard");
const infoEl = Game_Container.querySelector("#info");
const totalMoves = Game_Container.querySelector("#total_moves");
const timerEl = Game_Container.querySelector("#timerEl");
const timerInput = menu_screen.querySelector("#timerInput");
const backMenu = Game_Container.querySelector("#backMenu");
const PairsGot = Game_Container.querySelector("#Pairs_Got");
const giveUpBtn = Game_Container.querySelector("#give_up");

const all_cards = GameBoard.getElementsByClassName("card");

const cooldown = 1500; 

const card_width = 100;
const card_height = 100;
const distance = 10;

var pickedCard;
var hiddenNumber = {};

let timer_Tick = null;
let timer = null;

let turn = false;

let win = false;
let lose = false;

let moves = 0;

var end_sound = null;

var Pairs_Obtain = [];

var gameRunning = false;

var cooldownActive = false;

window.onload = function () {
    giveUpBtn.addEventListener("click", giveUp);
    backMenu.addEventListener("click", backToMenu);
    check_timer.addEventListener("click", displayTimer);
};

function giveUp() {
    if (confirm("Are You Sure That You Want To Give Up?")) {
        backToMenu();
    }
}

function displayTimer() {
    if (check_timer.checked) {
        timerInput.style.display = "block";
    } else {
        timerInput.style.display = "none";
    }
}

const SFX = {
    goodSwap: new Audio("resources/correct.mp3"),
    badSwap: new Audio("resources/incorrect.mp3"),
    win: new Audio("resources/win.mp3"),
    lose: new Audio("resources/lose.mp3"),
};
Object.freeze(SFX);

for (let i = 2; i <= 8; i += 2) {
    const button = document.createElement("button");
    button.textContent = `${i}x${i}`;
    button.addEventListener("click", startGame);
    button.addEventListener("mouseover", showPairs);
    button.id = i;
    size_buttons.append(button);
}

function showPairs() {
    let total = (this.id * this.id) / 2;
    show_pairs.textContent = total + " pairs in total";
}

function startGame() {
    if (check_timer.checked) {
        timer = timerInput.value; 
        TickTimer();
    }
    totalMoves.textContent = moves;
    menu_screen.style.display = "none";
    Game_Container.style.display = "block";
    GameBoard.style.display = "block";
    giveUpBtn.style.display = "block";
    infoEl.textContent = "pick the first card";
    PairsGot.textContent = "none";
    turn = true;
    gameRunning = true;
    
    const rows = parseInt(this.id);
    const cols = parseInt(this.id);
    const game_width = rows * card_width + distance * (rows + 1);
    const game_height = cols * card_height + distance * (cols + 1);
    const total_cards = rows * cols;
    const total_pairs = Math.floor(total_cards / 2);

    GameBoard.style.width = `${game_width}px`;
    GameBoard.style.height = `${game_height}px`;

    const possible_pairs = [];
    for (let i = 1; i <= total_pairs; i++) {
        possible_pairs.push(i, i);
    }
    
    console.log(
        `%ctotal pairs in game: ${possible_pairs.length}`,
        "font-weight: bold; font-family: system-ui; text-transform: capitalize; font-size: 25px;"
    );

    const randomize_pairs = [];

    while (possible_pairs.length > 0) {
        var index = Math.floor(Math.random() * possible_pairs.length);
        randomize_pairs.push(possible_pairs[index]);
        possible_pairs.splice(index, 1); 
    }
    

    for (let row = 0; row < rows; row++) {
        
        for (let col = 0; col < cols; col++) {
            var position = `[${row}][${col}]`;
            hiddenNumber[position] = randomize_pairs.pop();
            const card = document.createElement("div");
            card.style.width = `${card_width}px`;
            card.style.height = `${card_height}px`;
            card.style.left = `${col * (card_width + distance) + distance}px`;
            card.style.top = `${row * (card_height + distance) + distance}px`;
            card.dataset.position = position;
            card.classList.add("card");
            card.setAttribute(
                "title",
                `card on row ${row + 1} at col ${col + 1}`
            );
            card.addEventListener("click", pickCard);
            GameBoard.append(card);
        }
    }
}

function pickCard(e) {
    var isRevealed = Boolean(this.getAttribute("data-revealed"));
    console.log(isRevealed);

    if (this == pickedCard || isRevealed || cooldownActive) {
        return;
    }

    this.textContent = hiddenNumber[this.dataset.position];

    if (pickedCard == undefined) {
        pickedCard = this;
        return;
    }

    var num1 = hiddenNumber[pickedCard.dataset.position];
    var num2 = hiddenNumber[this.dataset.position];

    if (num1 == num2) {
        this.dataset.revealed = "true";
        pickedCard.dataset.revealed = "true";
        good_swap(pickedCard, this);
    } else {
        bad_swap();
    }

    cooldownActive = true;
    moves++;
    totalMoves.textContent = moves;

    setTimeout(() => {
        if (num1 == num2) {
            pickedCard.remove();
            this.remove();

            if (checkWin()) {
                Win_function();
            }
        } else {
            this.textContent = "";
            pickedCard.textContent = "";
        }
        pickedCard = undefined;
        cooldownActive = false;
    }, cooldown);
}

function good_swap(card_1, card_2) {
    Pairs_Obtain.push(
        `<span>[${hiddenNumber[card_1.dataset.position]} ~ ${hiddenNumber[card_2.dataset.position]
        }]</span>`
    );
    PairsGot.innerHTML = Pairs_Obtain.join(" | ");
    var color = Random_Color();
    infoEl.style.color = "green";
    infoEl.textContent = "correct!";
    card_1.style.backgroundColor = color;
    card_2.style.backgroundColor = color;
    console.log(
        "%cgood swap.",
        "color: green; text-transform: uppercase; font-family: Noto Sans, sans-serif;"
    );
    SFX.goodSwap.play();
}

function turnUpsideDownCard() {
    console.log(
        "%cbad swap.",
        "color: red; text-transform: uppercase; font-family: Noto Sans, sans-serif;"
    );
    card_1.textContent = "";
    card_2.textContent = "";
    card_1.addEventListener("click", pickCard);
    card_2.addEventListener("click", pickCard);
}

function bad_swap() {
    infoEl.textContent = "incorrect!";
    infoEl.style.color = "red";
    SFX.badSwap.play();
}

function checkWin() {
    return all_cards.length == 0 ? true : false;
}

function Win_function() {
    EndGame("You Won!", "win");
    win = true;
    GameBoard.style.display = "none";
    infoEl.removeAttribute("style");
    infoEl.style.fontSize = "30px";
    if (timer != null) {
        timerEl.style.display = "none";
        clearInterval(timer_Tick);
    }
}

function Lose_function() {
    
    EndGame("You Lose. Time Out!", "lose");
    for (let i = 0; i < all_cards.length; i++) {
        all_cards[i].removeEventListener("click", pickCard);
    }
    if (card_1 != "") {
        card_1.textContent = "";
    }
    if (card_2 != "") {
        card_2.textContent = "";
    }
    
    lose = true;
}

function EndGame(EndText, sound) {
    end_sound = SFX[sound];
    end_sound.play();
    infoEl.textContent = EndText;
    backMenu.style.display = "block";
    giveUpBtn.style.display = "none";
    gameRunning = false;
    
}

function backToMenu() {
    show_pairs.textContent = "pairs will show here";
    if (end_sound != null) {
        if (!end_sound.paused) {
            end_sound.pause();
            end_sound.currentTime = 0;
        }
        end_sound = null;
    }
    hiddenNumber = {};
    turn = false;
    win = false;
    lose = false;
    if (timer != null) {
        timer = null;
        timer_Tick = null;
    }
    card_1 = "";
    card_2 = "";
    moves = 0;
    Pairs_Obtain = [];
    if (gameRunning) {
        gameRunning = false;
        if (infoEl.style.color != "black") {
            infoEl.style.color = "black";
        }
    }
    PairsGot.innerHTML = "";
    GameBoard.removeAttribute("style");
    infoEl.textContent = "";
    infoEl.removeAttribute("style");
    backMenu.style.display = "none";
    Game_Container.style.display = "none";
    menu_screen.style.display = "block";
    timerEl.style.display = "none";
    totalMoves.textContent = "";
    GameBoard.innerHTML = "";
}

function TickTimer() {
    var seconds = 0;
    var minutes = 0;

    if (timer < 60) {
        seconds = timer;
        minutes = 0;
    } else {
        minutes = timer / 60;
        if (!Number.isInteger(minutes)) {
            console.log((minutes % 1) * 60);
            seconds = Math.round((minutes % 1) * 60);
            minutes = Math.floor(minutes);
        } else {
            seconds = 0;
        }
    }

    timerEl.style.display = "block";
    timerEl.textContent = `${minutes}:${seconds}`;

    timer_Tick = setInterval(() => {
        if (seconds <= 0 && minutes <= 0) {
            if (card_1 == "" || card_2 == "") {
                Lose_function();
                clearInterval(timer_Tick);
            } else {
                seconds = 0;
            }
            alert("You Lose");
        } else {
            seconds--;
            if (seconds < 0) {
                seconds = 59;
                minutes--;
            }
        }

        timerEl.textContent = `${minutes}:${seconds}`;
    }, 1000);
}

function Random_Color() {
    let rgb1 = Math.floor(Math.random() * 256);
    let rgb2 = Math.floor(Math.random() * 256);
    let rgb3 = Math.floor(Math.random() * 256);
    return `rgb(${rgb1},${rgb2},${rgb3})`;
}


