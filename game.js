class SnakeGame {
  constructor(options) {
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.scorePill = options.scorePill;
    this.statusPill = options.statusPill;
    this.restartButton = options.restartButton;
    this.touchButtons = options.touchButtons;
    this.cols = 20;
    this.rows = 20;
    this.baseTickMs = 120;
    this.enemyTickMs = 360;
    this.lastTick = 0;
    this.lastEnemyTick = 0;
    this.running = false;
    this.gameOver = false;
    this.score = 0;
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.pendingDirection = null;
    this.snake = [];
    this.food = { x: 0, y: 0 };
    this.enemy = { x: 0, y: 0, dx: 1, dy: 0 };
    this.cellSize = 24;
    this.swipeStart = null;

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.loop = this.loop.bind(this);
  }

  init() {
    this.attachEvents();
    this.reset();
    this.onResize();
    requestAnimationFrame(this.loop);
  }

  attachEvents() {
    document.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("resize", this.onResize);
    this.restartButton?.addEventListener("click", () => this.reset(true));

    this.touchButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const dir = button.dataset.dir;
        if (dir) {
          this.queueDirection(dir);
          this.start();
        }
      });
    });

    this.canvas.addEventListener("pointerdown", this.onPointerDown);
    this.canvas.addEventListener("pointermove", this.onPointerMove);
    this.canvas.addEventListener("pointerup", this.onPointerUp);
    this.canvas.addEventListener("pointercancel", this.onPointerUp);
    this.canvas.addEventListener("pointerleave", this.onPointerUp);
  }

  reset(startRunning = false) {
    const midX = Math.floor(this.cols / 2);
    const midY = Math.floor(this.rows / 2);
    this.snake = [
      { x: midX - 1, y: midY },
      { x: midX, y: midY },
      { x: midX + 1, y: midY },
    ];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.pendingDirection = null;
    this.score = 0;
    this.gameOver = false;
    this.running = startRunning;
    this.placeFood();
    this.placeEnemy();
    this.updateHud(startRunning ? "Running" : "Ready");
    this.draw();
  }

  start() {
    if (!this.running && !this.gameOver) {
      this.running = true;
      this.updateHud("Running");
    }
  }

  updateHud(status) {
    if (this.scorePill) {
      this.scorePill.textContent = `Score ${this.score}`;
    }
    if (this.statusPill) {
      this.statusPill.textContent = status;
    }
  }

  onResize() {
    const rect = this.canvas.getBoundingClientRect();
    const size = Math.max(280, Math.min(560, Math.floor(rect.width)));
    this.canvas.width = size;
    this.canvas.height = size;
    this.cellSize = size / this.cols;
    this.draw();
  }

  onKeyDown(event) {
    const key = event.key.toLowerCase();
    const mapping = {
      arrowup: "up",
      w: "up",
      arrowdown: "down",
      s: "down",
      arrowleft: "left",
      a: "left",
      arrowright: "right",
      d: "right",
    };
    if (mapping[key]) {
      event.preventDefault();
      this.queueDirection(mapping[key]);
      this.start();
    }
  }

  onPointerDown(event) {
    this.swipeStart = { x: event.clientX, y: event.clientY };
    this.canvas.setPointerCapture?.(event.pointerId);
  }

  onPointerMove(event) {
    if (!this.swipeStart) {
      return;
    }
    const dx = event.clientX - this.swipeStart.x;
    const dy = event.clientY - this.swipeStart.y;
    const threshold = 18;
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) {
      return;
    }
    if (Math.abs(dx) > Math.abs(dy)) {
      this.queueDirection(dx > 0 ? "right" : "left");
    } else {
      this.queueDirection(dy > 0 ? "down" : "up");
    }
    this.swipeStart = { x: event.clientX, y: event.clientY };
    this.start();
  }

  onPointerUp() {
    this.swipeStart = null;
  }

  queueDirection(dir) {
    const map = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
    };
    const candidate = map[dir];
    if (!candidate) {
      return;
    }
    const current = this.nextDirection || this.direction;
    const isOpposite = candidate.x === -current.x && candidate.y === -current.y;
    if (!isOpposite) {
      this.pendingDirection = candidate;
    }
  }

  loop(timestamp) {
    if (!this.lastTick) {
      this.lastTick = timestamp;
      this.lastEnemyTick = timestamp;
    }
    if (this.running && !this.gameOver) {
      if (this.pendingDirection) {
        this.nextDirection = this.pendingDirection;
        this.pendingDirection = null;
      }
      if (timestamp - this.lastTick >= this.baseTickMs) {
        this.step();
        this.lastTick = timestamp;
      }
      if (timestamp - this.lastEnemyTick >= this.enemyTickMs) {
        this.moveEnemy();
        this.lastEnemyTick = timestamp;
      }
    }
    this.draw();
    requestAnimationFrame(this.loop);
  }

  step() {
    this.direction = this.nextDirection;
    const head = this.snake[this.snake.length - 1];
    const nextHead = this.wrap({
      x: head.x + this.direction.x,
      y: head.y + this.direction.y,
    });

    if (this.snake.some((segment, index) => index < this.snake.length - 1 && segment.x === nextHead.x && segment.y === nextHead.y)) {
      this.endGame("Hit self");
      return;
    }

    this.snake.push(nextHead);

    if (nextHead.x === this.food.x && nextHead.y === this.food.y) {
      this.score += 10;
      this.placeFood();
      this.updateHud("Running");
    } else {
      this.snake.shift();
    }

    if (nextHead.x === this.enemy.x && nextHead.y === this.enemy.y) {
      this.endGame("Caught by enemy");
    }
  }

  moveEnemy() {
    const dirs = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];
    const choices = dirs.map((dir) => ({
      ...this.wrap({ x: this.enemy.x + dir.x, y: this.enemy.y + dir.y }),
      dx: dir.x,
      dy: dir.y,
    }));

    if (choices.length > 0) {
      const pick = choices[Math.floor(Math.random() * choices.length)];
      this.enemy = pick;
    }

    if (this.enemy.x === this.snake[this.snake.length - 1].x && this.enemy.y === this.snake[this.snake.length - 1].y) {
      this.endGame("Caught by enemy");
    }
  }

  endGame(reason) {
    this.gameOver = true;
    this.running = false;
    this.updateHud(`Game Over: ${reason}`);
  }

  wrap(point) {
    return {
      x: (point.x + this.cols) % this.cols,
      y: (point.y + this.rows) % this.rows,
    };
  }

  placeFood() {
    let food;
    do {
      food = {
        x: Math.floor(Math.random() * this.cols),
        y: Math.floor(Math.random() * this.rows),
      };
    } while (this.occupied(food));
    this.food = food;
  }

  placeEnemy() {
    let enemy;
    do {
      enemy = {
        x: Math.floor(Math.random() * this.cols),
        y: Math.floor(Math.random() * this.rows),
        dx: 1,
        dy: 0,
      };
    } while (this.occupied(enemy));
    this.enemy = enemy;
  }

  occupied(point) {
    return this.snake.some((segment) => segment.x === point.x && segment.y === point.y) ||
      (this.food.x === point.x && this.food.y === point.y);
  }

  drawGrid() {
    const { ctx, canvas } = this;
    ctx.strokeStyle = "rgba(77, 255, 136, 0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= this.cols; i += 1) {
      const pos = Math.round(i * this.cellSize) + 0.5;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i <= this.rows; i += 1) {
      const pos = Math.round(i * this.cellSize) + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(canvas.width, pos);
      ctx.stroke();
    }
  }

  drawCell(point, fill, glow = fill) {
    const { ctx } = this;
    const x = point.x * this.cellSize;
    const y = point.y * this.cellSize;
    const inset = this.cellSize * 0.12;
    ctx.save();
    ctx.shadowColor = glow;
    ctx.shadowBlur = 14;
    ctx.fillStyle = fill;
    ctx.fillRect(x + inset, y + inset, this.cellSize - inset * 2, this.cellSize - inset * 2);
    ctx.restore();
  }

  draw() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const background = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    background.addColorStop(0, "#020603");
    background.addColorStop(1, "#07150b");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.drawGrid();

    this.drawCell(this.food, "#d7ff67", "rgba(215, 255, 103, 0.8)");
    this.drawCell(this.enemy, "#ff5a6f", "rgba(255, 90, 111, 0.85)");

    this.snake.forEach((segment, index) => {
      const alpha = 0.3 + ((index + 1) / this.snake.length) * 0.7;
      const color = index === this.snake.length - 1
        ? `rgba(77, 255, 136, ${alpha})`
        : `rgba(31, 179, 92, ${alpha})`;
      this.drawCell(segment, color, "rgba(77, 255, 136, 0.8)");
    });

    if (this.gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.62)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#d8ffe0";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "700 24px Segoe UI, sans-serif";
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 18);
      ctx.font = "500 14px Segoe UI, sans-serif";
      ctx.fillText("Restart 버튼을 눌러 다시 시작하세요", canvas.width / 2, canvas.height / 2 + 16);
    }
  }
}

window.SnakeGame = SnakeGame;
