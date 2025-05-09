document.addEventListener("DOMContentLoaded", async () => {
  const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vT6wjiYOweHcg7SsiPXU9WVVz8o2DDQT-VGARJe0u-GJA6RWPMMGYruoVnvbQ2xDD2lFF1nSGT104pg/pub?output=csv";

  const categories = ["CPU", "GPU", "RAM", "SSD", "PSU", "Case", "Cooler", "Fans"];
  const partList = {};
  let parts = [];

  async function loadCSVData(url) {
    const response = await fetch(url);
    const data = await response.text();
    const rows = data.trim().split("\n").map((r) => r.split(","));
    const headers = rows[0];
    return rows.slice(1).map((row) => {
      const obj = {};
      headers.forEach((h, i) => (obj[h.trim()] = row[i].trim()));
      return obj;
    });
  }

  function createComponentUI(category) {
    const section = document.getElementById("builder");
    const div = document.createElement("div");
    div.className = "component-block";
    div.innerHTML = `
      <h2>${category}</h2>
      <button onclick="addPart('${category}')">Add ${category}</button>
      <div id="${category}-list"></div>
    `;
    section.appendChild(div);
  }

  window.addPart = function (category) {
    const modal = document.getElementById("modal");
    modal.innerHTML = "";
    const list = document.createElement("div");
    list.className = "part-list";

    const filtered = parts.filter((p) => p.Category === category);
    filtered.forEach((part) => {
      const item = document.createElement("div");
      item.className = "part-item";
      item.innerHTML = `
        <strong>${part.Name}</strong><br>
        ${part.Specs}<br>
        <select>
          <option disabled selected>Choose Store</option>
          ${part.Store && part.Store !== "" ? `<option value="${part.Price}">${part.Store}: ₹${part.Price}</option>` : ""}
          ${part["Store 2"] && part["Store 2"] !== "" ? `<option value="${part["Price 2"]}">${part["Store 2"]}: ₹${part["Price 2"]}</option>` : ""}
        </select>
        <button onclick='confirmAdd(${JSON.stringify(part).replaceAll("'", "\'")})'>Select</button>
      `;
      list.appendChild(item);
    });
    modal.appendChild(list);
    modal.style.display = "block";
  };

  window.confirmAdd = function (rawPart) {
    const part = typeof rawPart === "string" ? JSON.parse(rawPart) : rawPart;
    const container = document.getElementById(`${part.Category}-list`);
    const div = document.createElement("div");
    div.className = "chosen-part";
    div.innerText = `${part.Name}`;
    container.appendChild(div);
    updatePrice();
    document.getElementById("modal").style.display = "none";
  };

  function updatePrice() {
    let total = 0;
    document.querySelectorAll(".chosen-part").forEach((el) => {
      const match = parts.find((p) => p.Name === el.innerText);
      if (match) {
        total += parseInt(match.Price);
      }
    });
    document.getElementById("total").innerText = `Total Price: ₹${total}`;
  }

  // Load all
  parts = await loadCSVData(SHEET_URL);
  categories.forEach(createComponentUI);

  // Modal close
  document.body.addEventListener("click", (e) => {
    if (e.target.id === "modal") document.getElementById("modal").style.display = "none";
  });
});
