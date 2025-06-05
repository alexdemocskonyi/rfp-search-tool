// script.js — full file

let data = [];
let model = null;

async function loadData() {
  const response = await fetch("rfp_data_with_real_embeddings.json");
  data = await response.json();
}

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

async function getQueryEmbedding(query) {
  if (!model) {
    const { pipeline } = await import("https://cdn.jsdelivr.net/npm/@xenova/transformers@2.4.1");
    model = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  const output = await model(query, { pooling: "mean", normalize: true });
  return output.data;
}

async function performSearch(query) {
  const queryEmbedding = await getQueryEmbedding(query);
  const scoredResults = data.map(item => ({
    ...item,
    score: cosineSimilarity(queryEmbedding, item.embedding)
  }));

  const results = scoredResults
    .filter(r => r.score > 0.55) // filter out weak matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  displayResults(results, query);
}

function displayResults(results, query) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (results.length === 0) {
    resultsDiv.innerHTML = `<p>No strong matches found for "<strong>${query}</strong>". Try rephrasing your query.</p>`;
    return;
  }

  results.forEach(result => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${result.question}</h3>
      <p>${result.answer}</p>
      <small>Match score: ${result.score.toFixed(3)}</small>
    `;
    resultsDiv.appendChild(card);
  });
}

document.getElementById("search-box").addEventListener("input", (e) => {
  const query = e.target.value.trim();
  if (query.length > 2) {
    performSearch(query);
  } else {
    document.getElementById("results").innerHTML = "";
  }
});

loadData();
