const menuButton = document.querySelector('#menuButton');
const closeMenuButton = document.querySelector('#closeMenuButton');
const drawer = document.querySelector('#drawer');
const shortlistButton = document.querySelector('#shortlistButton');
const closeShortlistButton = document.querySelector('#closeShortlistButton');
const shortlistPanel = document.querySelector('#shortlistPanel');
const shortlistCount = document.querySelector('#shortlistCount');
const shortlistItems = document.querySelector('#shortlistItems');
const shortlistEmpty = document.querySelector('#shortlistEmpty');
const searchInput = document.querySelector('#searchInput');
const resetButton = document.querySelector('#resetButton');
const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.art-card');
const actionsTemplate = document.querySelector('#artActionsTemplate');

const selectedWorks = new Set();
let activeFilter = 'all';

cards.forEach((card) => {
  const action = actionsTemplate.content.cloneNode(true);
  const button = action.querySelector('button');
  const title = card.querySelector('a').textContent;

  button.addEventListener('click', () => {
    if (selectedWorks.has(title)) {
      selectedWorks.delete(title);
      button.textContent = 'Add to shortlist';
    } else {
      selectedWorks.add(title);
      button.textContent = 'Remove from shortlist';
    }

    renderShortlist();
  });

  card.append(action);
});

function setPanel(panel, trigger, open) {
  panel.classList.toggle('open', open);
  panel.setAttribute('aria-hidden', String(!open));
  trigger.setAttribute('aria-expanded', String(open));
}

function renderShortlist() {
  shortlistCount.textContent = `(${selectedWorks.size})`;
  shortlistItems.innerHTML = '';
  shortlistEmpty.hidden = selectedWorks.size > 0;

  selectedWorks.forEach((title) => {
    const item = document.createElement('li');
    item.textContent = title;
    shortlistItems.append(item);
  });
}

function applyFilters() {
  const term = searchInput.value.trim().toLowerCase();

  cards.forEach((card) => {
    const title = card.querySelector('a').textContent.toLowerCase();
    const meta = card.querySelector('p').textContent.toLowerCase();
    const matchesFilter = activeFilter === 'all' || card.dataset.category === activeFilter;
    const matchesSearch = !term || title.includes(term) || meta.includes(term);

    card.classList.toggle('hidden', !(matchesFilter && matchesSearch));
  });
}

menuButton.addEventListener('click', () => setPanel(drawer, menuButton, true));
closeMenuButton.addEventListener('click', () => setPanel(drawer, menuButton, false));
shortlistButton.addEventListener('click', () => setPanel(shortlistPanel, shortlistButton, true));
closeShortlistButton.addEventListener('click', () => setPanel(shortlistPanel, shortlistButton, false));

filters.forEach((filter) => {
  filter.addEventListener('click', () => {
    activeFilter = filter.dataset.filter;
    filters.forEach((item) => {
      item.classList.toggle('active', item === filter);
      item.setAttribute('aria-selected', String(item === filter));
    });
    applyFilters();
  });
});

searchInput.addEventListener('input', applyFilters);

resetButton.addEventListener('click', () => {
  activeFilter = 'all';
  searchInput.value = '';
  filters.forEach((item) => {
    item.classList.toggle('active', item.dataset.filter === 'all');
    item.setAttribute('aria-selected', String(item.dataset.filter === 'all'));
  });
  applyFilters();
});
