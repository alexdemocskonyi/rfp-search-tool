let data = [];

async function loadEmbeddings() {
  const response = await fetch('rfp_data_with_local_embeddings.json');
  data = await response.json();
  console.log(`✅ Loaded ${data.length} entries`);
}

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

async function embedQuery(query) {
  const model = await window.sentenceTransformers.load('all-MiniLM-L6-v2');
  const embedding = await model.embed(query);
  return embedding;
}

async function search(query) {
  const queryEmbedding = await embedQuery(query);
  const scored = data.map(item => ({
    ...item,
    score: cosineSimilarity(queryEmbedding, item.embedding)
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.filter(item => item.score > 0.5).slice(0, 5); // threshold & top 5
}

function displayResults(results) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';
  if (results.length === 0) {
    resultsDiv.innerHTML = '<p>No results found.</p>';
    return;
  }
  results.forEach(({ question, answer, score }) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<strong>${question}</strong><br/><small>Score: ${score.toFixed(3)}</small><br/><p>${answer}</p>`;
    resultsDiv.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadEmbeddings();

  const input = document.getElementById('search-box');
  input.addEventListener('input', async () => {
    const query = input.value.trim();
    if (query.length < 3) return;
    const results = await search(query);
    displayResults(results);
  });
});
