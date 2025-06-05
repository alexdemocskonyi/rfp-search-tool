let data = [];

fetch("rfp_data_with_local_embeddings.json")
  .then((res) => {
    if (!res.ok) throw new Error("Failed to load JSON");
    return res.json();
  })
  .then((json) => {
    data = json;
    console.log("✅ Loaded", data.length, "records.");
  })
  .catch((err) => {
    console.error("❌ Failed to load data:", err);
  });

function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  return dot / (magA * magB);
}

async function getQueryEmbedding(query) {
  const model = await window.sbert.load();
  return await model.embed(query);
}

document.addEventListener("DOMContentLoaded", async () => {
  const input = document.querySelector("input");
  const resultsContainer = document.createElement("div");
  document.body.appendChild(resultsContainer);

  const model = await window.sbert.load();

  input.addEventListener("input", async () => {
    const query = input.value.trim();
    if (!query || data.length === 0) return;

    const queryEmbedding = await model.embed(query);

    const scored = data
      .map((item) => ({
        ...item,
        score: cosineSimilarity(queryEmbedding, item.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .filter((item) => item.score > 0.3)
      .slice(0, 10);

    resultsContainer.innerHTML = "";
    scored.forEach((item) => {
      const box = document.createElement("div");
      box.style.padding = "10px";
      box.style.border = "1px solid #ddd";
      box.style.marginBottom = "10px";
      box.style.borderRadius = "5px";
      box.innerHTML = `<strong>Q:</strong> ${item.question}<br><strong>A:</strong> ${item.answer}<br><em>Score: ${item.score.toFixed(3)}</em>`;
      resultsContainer.appendChild(box);
    });
  });
});
