const pause_button = document.getElementById("pause_resume");
const theme_toggle = document.getElementById("theme_toggle");
const snake_color_select = document.getElementById("snake_color");
const high_score_display = document.getElementById("high_score");
const game_canvas = document.getElementById("game_canvas");
const draw_ctx = game_canvas.getContext("2d");
const score_display = document.getElementById("score");
const start_button = document.getElementById("start_button");
const restart_button = document.getElementById("restart");
const touch_controls = document.getElementById("touch_controls");

let high_score = localStorage.getItem("snake_high_score") || 0;
high_score_display.textContent = high_score;

let is_paused = false;
let current_snake_color = "green";
let snake, food, dx, dy, score, game;
const box = 20;

// music
const eatSound = new Audio("music_food.mp3");
const gameOverSound = new Audio("music_gameover.mp3");
const gamemusic = new Audio("music_game.mp3");

pause_button.addEventListener("click", () => {
    is_paused = !is_paused;
    pause_button.textContent = is_paused ? "Resume" : "Pause";
});

theme_toggle.addEventListener("change", () => {
    if (theme_toggle.value === "light") {
        document.body.style.backgroundColor = "#fff";
        document.querySelector(".container").style.backgroundColor = "#ccc";
    } else {
        document.body.style.backgroundColor = "#111";
        document.querySelector(".container").style.backgroundColor = "#222";
    }
});

snake_color_select.addEventListener("change", () => {
    current_snake_color = snake_color_select.value;
});

start_button.addEventListener("click", start_game);
restart_button.addEventListener("click", start_game);
document.addEventListener("keydown", change_direction);

function start_game() {
    gamemusic.play();
    const selected_speed = 150;

    snake = [{ x: 10 * box, y: 10 * box }];
    dx = box;
    dy = 0;
    score = 0;
    score_display.textContent = score;

    resizeCanvas();
    spawn_food();

    game_canvas.style.display = "block";
    start_button.style.display = "none";
    restart_button.style.display = "none";

    if (window.innerWidth <= 768) {
        touch_controls.style.display = "block";
    } else {
        touch_controls.style.display = "none";
    }

    if (game) clearInterval(game);
    game = setInterval(update_game, selected_speed);
}

function resizeCanvas() {
    game_canvas.width = Math.min(window.innerWidth * 0.9, 400);
    game_canvas.height = Math.min(window.innerWidth * 0.9, 400);
}

function spawn_food() {
    const cols = Math.floor(game_canvas.width / box);
    const rows = Math.floor(game_canvas.height / box);
    food = {
        x: Math.floor(Math.random() * cols) * box,
        y: Math.floor(Math.random() * rows) * box
    };
}

function change_direction(event) {
    if (event.key === "ArrowUp" && dy === 0) {
        dx = 0;
        dy = -box;
    } else if (event.key === "ArrowDown" && dy === 0) {
        dx = 0;
        dy = box;
    } else if (event.key === "ArrowLeft" && dx === 0) {
        dx = -box;
        dy = 0;
    } else if (event.key === "ArrowRight" && dx === 0) {
        dx = box;
        dy = 0;
    }
}

function touch_move(direction) {
    if (direction === "up" && dy === 0) {
        dx = 0;
        dy = -box;
    } else if (direction === "down" && dy === 0) {
        dx = 0;
        dy = box;
    } else if (direction === "left" && dx === 0) {
        dx = -box;
        dy = 0;
    } else if (direction === "right" && dx === 0) {
        dx = box;
        dy = 0;
    }
}

function update_game() {
    if (is_paused) return;

    draw_ctx.clearRect(0, 0, game_canvas.width, game_canvas.height);

    snake.forEach((part) => {
        draw_ctx.fillStyle = current_snake_color;
        draw_ctx.fillRect(part.x, part.y, box, box);
    });

    draw_ctx.fillStyle = "red";
    draw_ctx.fillRect(food.x, food.y, box, box);

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        eatSound.play();
        score_display.textContent = score;
        spawn_food();
    } else {
        snake.pop();
    }

    if (
        head.x < 0 || head.x >= game_canvas.width ||
        head.y < 0 || head.y >= game_canvas.height ||
        snake.some(p => p.x === head.x && p.y === head.y)
    ) {
        end_game();
        return;
    }

    snake.unshift(head);
}

function end_game() {
    clearInterval(game);
    gamemusic.pause();
    gamemusic.currentTime = 0;
    gameOverSound.play();

    if (score > high_score) {
        localStorage.setItem("snake_high_score", score);
        high_score_display.textContent = score;
    }

    game_canvas.style.display = "none";
    restart_button.style.display = "inline-block";
    touch_controls.style.display = "none";

    const oldGameOver = document.getElementById("game_over_text");
    if (oldGameOver) oldGameOver.remove();

    const gameOverText = document.createElement("p");
    gameOverText.textContent = "Game Over! Final Score: " + score;
    gameOverText.style.color = "red";
    gameOverText.style.fontSize = "24px";
    gameOverText.id = "game_over_text";

    document.querySelector(".container").appendChild(gameOverText);
}
