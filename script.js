
let data = [];

async function loadData() {
  const res = await fetch("rfp_data_with_local_embeddings.json");
  data = await res.json();
  console.log("✅ Loaded:", data.length, "entries");
}

function cosineSimilarity(a, b) {
  let dot = 0.0, normA = 0.0, normB = 0.0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function runSearch(query) {
  const model = await window.sbert.load();
  const embedding = await model.embed(query);

  const results = data.map((item) => {
    const score = cosineSimilarity(item.embedding, embedding);
    return {
      question: item.question,
      answer: item.answer,
      score,
    };
  });

  results.sort((a, b) => b.score - a.score);

  const container = document.getElementById("results");
  container.innerHTML = "";

  results
    .filter((r) => r.score > 0.4)
    .forEach((r) => {
      const el = document.createElement("div");
      el.className = "result";
      el.innerHTML = `
        <h3>${r.question}</h3>
        <p>${r.answer}</p>
        <small>Score: ${r.score.toFixed(3)}</small>
      `;
      container.appendChild(el);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadData();
  console.log("Search ready ✅");

  document
    .getElementById("search-box")
    .addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        const query = e.target.value.trim();
        if (query.length > 0) {
          runSearch(query);
        }
      }
    });
});
