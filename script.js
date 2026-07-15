document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") {
      return;
    }
    const target = document.querySelector(targetId);
    if (target) {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
  });
});

const gameCanvas = document.getElementById("game-canvas");
const scorePill = document.getElementById("score-pill");
const statusPill = document.getElementById("status-pill");
const restartButton = document.getElementById("restart-btn");
const touchButtons = document.querySelectorAll(".touch-btn");

if (gameCanvas && window.SnakeGame) {
  const game = new window.SnakeGame({
    canvas: gameCanvas,
    scorePill,
    statusPill,
    restartButton,
    touchButtons,
  });
  game.init();
}
