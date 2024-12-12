const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startBtn = document.getElementById('startBtn');
const gameOverPanel = document.getElementById('gameOverPanel');
const playerNameInput = document.getElementById('playerName');
const submitScoreBtn = document.getElementById('submitScoreBtn');
const scoreList = document.getElementById('scoreList');

let playerX = canvas.width / 2;
let playerY = canvas.height - 80;
let playerWidth = 50;
let playerHeight = 50;

let leftPressed = false;
let rightPressed = false;

let obstacles = [];
let obstacleSpeed = 3;
let obstacleFrequency = 60; // 프레임 간격으로 장애물 생성
let frameCount = 0;

let gameRunning = false;
let gameOver = false;
let score = 0;

let playerImage = new Image();
playerImage.src = './assets/player.png';

let obstacleImage = new Image();
obstacleImage.src = './assets/obstacle.png';

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

function keyDownHandler(e) {
    if (e.key === 'ArrowLeft') leftPressed = true;
    if (e.key === 'ArrowRight') rightPressed = true;
}

function keyUpHandler(e) {
    if (e.key === 'ArrowLeft') leftPressed = false;
    if (e.key === 'ArrowRight') rightPressed = false;
}

function resetGame() {
    playerX = canvas.width / 2 - playerWidth / 2;
    playerY = canvas.height - 80;
    obstacles = [];
    score = 0;
    frameCount = 0;
    gameOver = false;
    gameOverPanel.classList.add('hidden');
}

function updateDifficulty() {
    // frameCount에 따라 난이도 조정
    // 예: 600프레임(약 10초 assuming 60fps) 마다 obstacleSpeed 1 증가
    obstacleSpeed = 3 + Math.floor(frameCount / 600);

    // frameCount에 따라 장애물 생성 빈도를 점차 줄이기(최소 20까지)
    obstacleFrequency = Math.max(20, 60 - Math.floor(frameCount / 600));
}

function update() {
    if (!gameRunning) return;

    // 난이도 업데이트
    updateDifficulty();

    // 좌우 이동
    if (leftPressed) playerX -= 5;
    if (rightPressed) playerX += 5;

    // 화면 밖으로 나가지 않게
    if (playerX < 0) playerX = 0;
    if (playerX + playerWidth > canvas.width) playerX = canvas.width - playerWidth;

    // 장애물 생성
    frameCount++;
    if (frameCount % obstacleFrequency === 0) {
        const obsX = Math.random() * (canvas.width - playerWidth);
        obstacles.push({x: obsX, y: -50, width: 50, height: 50});
    }

    // 장애물 이동 및 충돌 체크
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].y += obstacleSpeed;

        // 충돌 체크 (플레이어 사각형과 장애물 사각형 충돌)
        if (intersectRect(
            playerX, playerY, playerWidth, playerHeight,
            obstacles[i].x, obstacles[i].y, obstacles[i].width, obstacles[i].height
        )) {
            // 충돌 발생 -> 게임 오버
            gameOver = true;
        }

        // 화면 아래로 넘어간 장애물은 점수 추가
        if (obstacles[i].y > canvas.height) {
            score++;
            // 제거
            obstacles.splice(i, 1);
            i--;
        }
    }

    if (gameOver) {
        gameRunning = false;
        showGameOverPanel();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 플레이어 그리기
    ctx.drawImage(playerImage, playerX, playerY, playerWidth, playerHeight);

    // 장애물 그리기
    for (let obs of obstacles) {
        ctx.drawImage(obstacleImage, obs.x, obs.y, obs.width, obs.height);
    }

    // 점수 표시
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function gameLoop() {
    update();
    draw();
    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

function intersectRect(x1, y1, w1, h1, x2, y2, w2, h2) {
    return !(x2 > x1 + w1 ||
        x2 + w2 < x1 ||
        y2 > y1 + h1 ||
        y2 + h2 < y1);
}

function showGameOverPanel() {
    gameOverPanel.classList.remove('hidden');
}

startBtn.addEventListener('click', () => {
    resetGame();
    gameRunning = true;
    gameLoop();
});

// 점수 제출 이벤트
submitScoreBtn.addEventListener('click', async () => {
    const name = playerNameInput.value.trim() || "NoName";
    await postScore(name, score);
    playerNameInput.value = "";
    await refreshLeaderboard();
});

async function refreshLeaderboard() {
    const scores = await getScores();
    scoreList.innerHTML = "";
    scores.forEach(s => {
        const li = document.createElement('li');
        li.textContent = `${s.name}: ${s.score}`;
        scoreList.appendChild(li);
    });
}

// 페이지 로드 시 리더보드 초기화
window.addEventListener('load', () => {
    refreshLeaderboard();
});
