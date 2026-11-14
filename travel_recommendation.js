const searchForm = document.getElementById('searchForm');
const btnReset = document.getElementById('btnReset');
const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('resultsContainer');
const resultsCount = document.getElementById('resultsCount');
const exploreButton = document.getElementById('exploreButton');

async function loadRecommendations() {
  const response = await fetch('travel_recommendation_api.json');
  if (!response.ok) {
    throw new Error(`Unable to load recommendations (${response.status})`);
  }
  return response.json();
}

function showMessage(title, message) {
  resultsCount.textContent = '';
  resultsContainer.innerHTML = '';
  const state = document.createElement('div');
  state.className = 'empty-state';
  state.innerHTML = `<span class="empty-icon" aria-hidden="true">✦</span>
    <h3>${title}</h3><p>${message}</p>`;
  resultsContainer.appendChild(state);
}

function findMatches(data, query) {
  if (query.includes('beach')) return data.beaches;
  if (query.includes('temple')) return data.temples;
  if (query.includes('countr')) return data.countries.flatMap(country => country.cities);

  const country = data.countries.find(item => item.name.toLowerCase().includes(query));
  if (country) return country.cities;

  return [...data.beaches, ...data.temples, ...data.countries.flatMap(country => country.cities)]
    .filter(item => `${item.name} ${item.description}`.toLowerCase().includes(query));
}

function renderResults(results) {
  resultsContainer.innerHTML = '';
  resultsCount.textContent = `${results.length} ${results.length === 1 ? 'place' : 'places'} found`;

  results.forEach(item => {
    const card = document.createElement('article');
    card.className = 'result-card';
    card.innerHTML = `
      <img src="${item.imageUrl}" alt="${item.name}" loading="lazy">
      <div class="result-card-body">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <button class="card-action" type="button">View destination <span aria-hidden="true">→</span></button>
      </div>`;
    resultsContainer.appendChild(card);
  });
}

async function searchRecommendations(event) {
  event?.preventDefault();
  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    showMessage('What are you looking for?', 'Try “beaches”, “temples”, “Japan”, or a destination name.');
    return;
  }

  resultsCount.textContent = 'Searching...';
  try {
    const data = await loadRecommendations();
    const matches = findMatches(data, query);
    if (matches.length === 0) {
      showMessage('No destinations found', 'Try “beaches”, “temples”, “Australia”, or “Japan”.');
      return;
    }
    renderResults(matches);
  } catch (error) {
    console.error('Error fetching travel data:', error);
    showMessage('Recommendations are unavailable', 'Please try again in a moment.');
  }
}

function clearResults() {
  searchInput.value = '';
  showMessage('Search to begin exploring', 'Discover destinations for your next story.');
  searchInput.focus();
}

searchForm.addEventListener('submit', searchRecommendations);
btnReset.addEventListener('click', clearResults);
exploreButton.addEventListener('click', () => searchInput.focus());
document.querySelectorAll('.search-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    searchInput.value = chip.dataset.query;
    searchRecommendations();
  });
});
