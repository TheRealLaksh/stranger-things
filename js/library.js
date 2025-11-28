document.querySelectorAll(".episode-card").forEach(card => {
  card.addEventListener("click", () => {
    const link = card.getAttribute("data-src");
    location.href = "player.html?src=" + encodeURIComponent(link);
  });
});
document.querySelectorAll(".episode-card").forEach(card => {
  card.addEventListener("click", () => {
    const url = card.getAttribute("data-src");
    location.href = "player.html?src=" + encodeURIComponent(url);
  });
});
