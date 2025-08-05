const API_BASE = "https://yourname.epizy.com"; // এখানে তোমার InfinityFree ডোমেইন বসাও

const tableBody = document.querySelector("#signalTable tbody");
const modeSelect = document.getElementById("modeSelect");
const manualGenerateBtn = document.getElementById("manualGenerateBtn");

let autoInterval = null;

async function getAccessToken() {
  const res = await fetch(`${API_BASE}/token.php`);
  if (!res.ok) {
    alert("Token fetch failed");
    return null;
  }
  const data = await res.json();
  return data.token;
}

function addSignalRow({ time, market, asset, timeframe, signal, strategy }) {
  if (tableBody.querySelector("tr td")?.textContent.includes("Waiting for signal")) {
    tableBody.innerHTML = "";
  }
  const row = document.createElement("tr");
  row.innerHTML = `<td>${time}</td><td>${market}</td><td>${asset}</td><td>${timeframe}</td><td class="${signal.toLowerCase()}">${signal}</td><td>${strategy}</td>`;
  tableBody.prepend(row);
}

async function generateSignal() {
  const token = await getAccessToken();
  if (!token) return;

  const res = await fetch(`${API_BASE}/signal-api.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      asset: document.getElementById("marketSelect").value,
      strategy: document.getElementById("strategySelect").value
    })
  });

  const data = await res.json();
  if (res.ok) {
    addSignalRow({
      time: new Date().toLocaleTimeString(),
      market: "Real Market",
      asset: document.getElementById("marketSelect").value,
      timeframe: "1m",
      signal: data.signal,
      strategy: document.getElementById("strategySelect").value
    });
  } else {
    alert(data.error || "Signal generation failed");
  }
}

modeSelect.addEventListener("change", () => {
  clearInterval(autoInterval);
  if (modeSelect.value === "auto") {
    manualGenerateBtn.style.display = "none";
    autoInterval = setInterval(generateSignal, 60000);
  } else {
    manualGenerateBtn.style.display = "inline-block";
  }
});

manualGenerateBtn.addEventListener("click", generateSignal);

autoInterval = setInterval(generateSignal, 60000);
