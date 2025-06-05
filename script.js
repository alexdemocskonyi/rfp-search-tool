let data = [];

fetch("rfp_data_with_local_embeddings.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    console.log("✅ Loaded", data.length, "records.");
  });

document.getElementById("search").addEventListener("input", e => {
  const query = e.target.value.trim().toLowerCase();
  const container = document.getElementById("results");
  container.innerHTML = "";

  if (!query) return;

  const results = data
    .filter(item => item.question.toLowerCase().includes(query))
    .slice(0, 10);

  if (results.length === 0) {
    container.innerHTML = "<p>No matches found.</p>";
    return;
  }

  results.forEach(item => {
    const div = document.createElement("div");
    div.className = "result";
    div.innerHTML = `
      <h3>Q: ${item.question}</h3>
      <p><strong>Answer:</strong> ${item.answer}</p>
    `;
    container.appendChild(div);
  });
});
