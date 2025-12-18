let clicks = 0;

document.getElementById("admin").addEventListener("click", () => {
  clicks++;
  console.log(clicks);
  if (clicks === 5) {
    window.location.href = "./admin.html";
  }
});