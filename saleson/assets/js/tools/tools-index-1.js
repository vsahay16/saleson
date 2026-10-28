
// ── Mobile Nav ──
const mobileMenu  = document.getElementById('mobileMenu');

// ── Tool Cards data ──
const allCards = Array.from(document.querySelectorAll('#toolsGrid .tool-card'));

// ── Category Filter ──
const filterTabs = document.querySelectorAll('.filter-tab');
let activeFilter = 'all';
let activeSearch = '';

function applyFilters() {
  let visibleCount = 0;
  allCards.forEach(function (card) {
    const cats   = card.getAttribute('data-cat') || '';
    const name   = card.getAttribute('data-name') || '';
    const catOk  = (activeFilter === 'all') || cats.includes(activeFilter);
    const searchOk = activeSearch === '' ||
      name.includes(activeSearch) ||
      (card.querySelector('.tool-name') || {}).textContent?.toLowerCase().includes(activeSearch);
    if (catOk && searchOk) {
      card.classList.remove('hidden');
      visibleCount++;
    } else {
      card.classList.add('hidden');
    }
  });
  const noResults = document.getElementById('noResults');
  if (visibleCount === 0) {
    document.getElementById('noResultsQuery').textContent = activeSearch || activeFilter;
    noResults.style.display = 'block';
  } else {
    noResults.style.display = 'none';
  }
}

filterTabs.forEach(function (tab) {
  tab.addEventListener('click', function () {
    filterTabs.forEach(function (t) {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    activeFilter = tab.getAttribute('data-cat');
    applyFilters();
    trackCTA('filter-' + activeFilter);
  });
});

// ── Search ──
const searchInput = document.getElementById('toolSearch');
searchInput.addEventListener('input', function () {
  activeSearch = this.value.trim().toLowerCase();
  applyFilters();
});

// ── FAQ Accordion ──
function toggleFaq(btn) {
  const answer  = btn.nextElementSibling;
  const isOpen  = btn.classList.contains('open');
  // Close all
  document.querySelectorAll('.faq-q').forEach(function (b) {
    b.classList.remove('open');
    b.setAttribute('aria-expanded', 'false');
    b.nextElementSibling.classList.remove('open');
  });
  // Open if was closed
  if (!isOpen) {
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    answer.classList.add('open');
  }
}

// ── CTA Tracking (placeholder) ──
function trackCTA(name) {
  console.log('[SalesOn CTA]', name, new Date().toISOString());
  // gtag('event', 'cta_click', { cta_name: name });
}

// ── Smooth Scroll for anchor links (supplement CSS) ──
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 70; // sticky nav height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
  });
});

