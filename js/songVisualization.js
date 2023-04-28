const songVisualization = (() => {
  const root = document.querySelector(":root");
  const trackWrapper = document.querySelector(".track-wrapper");
  const canvas = document.querySelector(".player-canvas");
  const ctx = canvas.getContext("2d");
  let canvasWidth = (canvas.width = trackWrapper.clientWidth);
  let canvasHeight = (canvas.height = trackWrapper.clientHeight);
  let barWidth = canvasWidth <= 100 ? 6 : canvasWidth <= 150 ? 8 : 10;
  ctx.strokeStyle =
    getComputedStyle(root).getPropertyValue("--black") || "#000";

  const visualizeSong = (data, maxPeakValue) => {
    const barCoeff = canvasHeight / maxPeakValue;
    const start = (canvasWidth - data.length * barWidth) / 2;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    for (let i = 0; i < data.length; i++) {
      const barHeight = data[i] * barCoeff;

      ctx.strokeRect(
        i * barWidth + start,
        canvasHeight - barHeight,
        barWidth,
        barHeight
      );
    }
  };

  const clearVisualization = () => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  };

  window.addEventListener("resize", () => {
    canvasWidth = canvas.width = trackWrapper.clientWidth;
    canvasHeight = canvas.height = trackWrapper.clientHeight;
    barWidth = canvasWidth <= 100 ? 6 : canvasWidth <= 150 ? 8 : 10;
  });

  return {
    visualizeSong,
    clearVisualization,
  };
})();
