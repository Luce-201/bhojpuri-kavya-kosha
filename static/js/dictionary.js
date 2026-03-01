// ============================================
// Bhojpuri Kavya Kosha — Word Tooltip
// Reads from window.BHOJPURI_DICTIONARY (set in baseof.html)
// ============================================

const dictionary = window.BHOJPURI_DICTIONARY || {};

// Make every word in .poem-body clickable
function makePoemWordsClickable() {
  const poemBody = document.getElementById('poem-text');
  if (!poemBody) return;

  const textNodes = [];
  const walker = document.createTreeWalker(poemBody, NodeFilter.SHOW_TEXT, null, false);
  let node;
  while ((node = walker.nextNode())) {
    if (node.textContent.trim()) textNodes.push(node);
  }

  textNodes.forEach(node => {
    const parent = node.parentNode;
    if (parent.classList && parent.classList.contains('poem-word')) return;

    const parts = node.textContent.split(/(\s+)/);
    const fragment = document.createDocumentFragment();

    parts.forEach(part => {
      if (/^\s+$/.test(part)) {
        // Pure whitespace — keep as is
        fragment.appendChild(document.createTextNode(part));
      } else {
        // A word — wrap it
        const cleanWord = part.replace(/[।,;:!?""''।]/g, '').trim();
        const span = document.createElement('span');
        span.textContent = part;
        span.className = 'poem-word';
        span.dataset.word = cleanWord;
        span.addEventListener('click', onWordClick);
        fragment.appendChild(span);
      }
    });

    parent.replaceChild(fragment, node);
  });
}

// Called when a word is clicked
function onWordClick(event) {
  const word = event.target.dataset.word;
  if (!word) return;

  // Try direct match first
  let meaning = dictionary[word];

  // If not found, try without diacritics variations
  if (!meaning) {
    const stripped = stripSuffix(word);
    if (stripped !== word) meaning = dictionary[stripped];
  }

  if (meaning) {
    showTooltip(word, meaning);
  } else {
    showTooltip(word, '(अर्थ उपलब्ध नहीं / meaning not in dictionary)');
  }
}

// Show the tooltip
function showTooltip(word, meaning) {
  const tooltip = document.getElementById('word-tooltip');
  tooltip.querySelector('.tooltip-word').textContent = word;
  tooltip.querySelector('.tooltip-meaning').textContent = meaning;
  tooltip.classList.remove('hidden');
}

// Close the tooltip
function closeTooltip() {
  document.getElementById('word-tooltip').classList.add('hidden');
}

// Close tooltip when clicking outside the poem
document.addEventListener('click', function(e) {
  if (!e.target.classList.contains('poem-word') && 
      !e.target.closest('#word-tooltip')) {
    closeTooltip();
  }
});

// Close with Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeTooltip();
});

// Simple suffix stripper for Hindi/Bhojpuri words
function stripSuffix(word) {
  const suffixes = ['ने', 'को', 'से', 'में', 'पर', 'के', 'की', 'का', 'ों', 'ाँ', 'ी', 'ा', 'े'];
  for (const suffix of suffixes) {
    if (word.endsWith(suffix) && word.length > suffix.length + 1) {
      return word.slice(0, -suffix.length);
    }
  }
  return word;
}

// Run when page loads
document.addEventListener('DOMContentLoaded', makePoemWordsClickable);
