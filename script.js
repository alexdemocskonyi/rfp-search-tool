let data = [];
const container = document.getElementById("results");
const input = document.getElementById("search-box");

async function loadData() {
  try {
    const res = await fetch("rfp_data_with_real_embeddings.json");
    data = await res.json();
    console.log(`✅ Loaded ${data.length} records.`);
  } catch (err) {
    console.error("❌ Failed to load data:", err);
  }
}

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (magA * magB);
}

function keywordScore(query, text) {
  return text.toLowerCase().includes(query.toLowerCase()) ? 0.3 : 0;
}

async function embedQuery(query) {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer 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"
    },
    body: JSON.stringify({
      input: query,
      model: "text-embedding-3-small"
    })
  });

  const json = await res.json();
  return json.data?.[0]?.embedding || null;
}

async function search(query) {
  if (query.length < 4) {
    container.innerHTML = "";
    return;
  }

  let queryEmbedding = null;
  try {
    queryEmbedding = await embedQuery(query);
  } catch (err) {
    console.warn("Embedding failed, falling back to keyword only");
  }

  const results = data
    .map(entry => {
      const similarity = queryEmbedding ? cosineSimilarity(queryEmbedding, entry.embedding) : 0;
      const keyword = keywordScore(query, entry.question);
      return {
        ...entry,
        score: similarity + keyword
      };
    })
    .filter(result => result.score >= 0.25)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  container.innerHTML = "";
  results.forEach(result => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>Q:</strong> ${result.question}<br>
      <strong>Answer:</strong> ${result.answer}<br>
      <small>Score: ${result.score.toFixed(3)}</small>
    `;
    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadData();
  input.addEventListener("input", e => {
    const query = e.target.value.trim();
    search(query);
  });
});
