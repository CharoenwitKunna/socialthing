// ==========================================================================
// THAILAND ECONOMIC EQUITY PROJECT — CLIENT-SIDE BEHAVIOR
// Impeccable Standard: Accessible, zero-jank, predictable state machines
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initStrategyTabs();
  initScrollSpy();
});

/* --------------------------------------------------------------------------
   THEME TOGGLER (PERSISTENT & ACCESSIBLE)
   -------------------------------------------------------------------------- */
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  const themeLabel = document.getElementById('theme-label');
  if (!toggleBtn) return;

  // Retrieve saved preference or system preference
  const savedTheme = localStorage.getItem('th-policy-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.body.classList.replace('theme-light', 'theme-dark');
    if (themeLabel) themeLabel.textContent = 'Switch to Light Mode';
  } else {
    document.body.classList.replace('theme-dark', 'theme-light');
    if (themeLabel) themeLabel.textContent = 'Switch to Dark Mode';
  }

  toggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('theme-dark');
    if (isDark) {
      document.body.classList.replace('theme-dark', 'theme-light');
      localStorage.setItem('th-policy-theme', 'light');
      if (themeLabel) themeLabel.textContent = 'Switch to Dark Mode';
    } else {
      document.body.classList.replace('theme-light', 'theme-dark');
      localStorage.setItem('th-policy-theme', 'dark');
      if (themeLabel) themeLabel.textContent = 'Switch to Light Mode';
    }
  });
}

/* --------------------------------------------------------------------------
   STRATEGY SWITCHER (PART 4: PRIMARY VS CONTINGENCY)
   -------------------------------------------------------------------------- */
function initStrategyTabs() {
  const tabPrimary = document.getElementById('tab-primary');
  const tabContingency = document.getElementById('tab-contingency');
  const panelPrimary = document.getElementById('panel-primary');
  const panelContingency = document.getElementById('panel-contingency');

  if (!tabPrimary || !tabContingency || !panelPrimary || !panelContingency) return;

  function switchTab(showPrimary) {
    if (showPrimary) {
      tabPrimary.classList.add('active');
      tabPrimary.setAttribute('aria-selected', 'true');
      tabContingency.classList.remove('active');
      tabContingency.setAttribute('aria-selected', 'false');

      panelPrimary.classList.add('active');
      panelPrimary.removeAttribute('hidden');
      panelContingency.classList.remove('active');
      panelContingency.setAttribute('hidden', '');
    } else {
      tabContingency.classList.add('active');
      tabContingency.setAttribute('aria-selected', 'true');
      tabPrimary.classList.remove('active');
      tabPrimary.setAttribute('aria-selected', 'false');

      panelContingency.classList.add('active');
      panelContingency.removeAttribute('hidden');
      panelPrimary.classList.remove('active');
      panelPrimary.setAttribute('hidden', '');
    }
  }

  tabPrimary.addEventListener('click', () => switchTab(true));
  tabContingency.addEventListener('click', () => switchTab(false));

  // Keyboard navigation between tabs
  [tabPrimary, tabContingency].forEach((tab) => {
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const isPrimaryActive = tabPrimary.classList.contains('active');
        switchTab(!isPrimaryActive);
        if (!isPrimaryActive) tabPrimary.focus();
        else tabContingency.focus();
      }
    });
  });
}

/* --------------------------------------------------------------------------
   FOOD BURDEN SIMULATOR (INTERACTIVE ANALYSIS)
   Empirical Model based on NESDC & Bank of Thailand Household Decile Ratios
   -------------------------------------------------------------------------- */
function initFoodBurdenSimulator() {
  const slider = document.getElementById('inflation-slider');
  const inflationDisplay = document.getElementById('inflation-val');
  const lowBurden = document.getElementById('low-income-burden');
  const highBurden = document.getElementById('high-income-burden');
  const lowVerdict = document.getElementById('low-income-verdict');

  if (!slider || !inflationDisplay || !lowBurden || !highBurden) return;

  // Baseline food spending proportions:
  // Low-income household: Baseline 48.5% at 0% shock
  // High-income household: Baseline 12.2% at 0% shock
  const BASELINE_LOW = 48.5;
  const BASELINE_HIGH = 12.2;

  function updateCalculations() {
    const shock = parseFloat(slider.value);
    inflationDisplay.textContent = `${shock}%`;

    // Calculate adjusted burden with inelastic demand multiplier
    const lowResult = (BASELINE_LOW * (1 + (shock / 100) * 0.95)).toFixed(1);
    const highResult = (BASELINE_HIGH * (1 + (shock / 100) * 0.35)).toFixed(1);

    lowBurden.textContent = `${lowResult}%`;
    highBurden.textContent = `${highResult}%`;

    // Dynamic descriptive verdict
    if (shock >= 25) {
      lowVerdict.textContent = 'Catastrophic Deficit: Household spends more than 60% of earnings on food. Severe nutritional deprivation, school dropouts, and predatory debt cycles occur.';
    } else if (shock >= 15) {
      lowVerdict.textContent = 'Critical Warning: Severe budget deficit. Family must cut nutrition, default on utilities, or pull children out of extracurricular schooling.';
    } else {
      lowVerdict.textContent = 'Strained Resilience: Household budget remains precarious with zero savings capacity and vulnerability to emergency medical shocks.';
    }
  }

  slider.addEventListener('input', updateCalculations);
  updateCalculations(); // Initialize on load
}

/* --------------------------------------------------------------------------
   READING PROGRESS BAR (HAIRLINE TRACK UNDER STICKY NAV)
   -------------------------------------------------------------------------- */
function initReadingProgressBar() {
  const bar = document.getElementById('reading-progress');
  if (!bar) return;

  function updateProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (docHeight <= 0) {
      bar.style.width = '0%';
      return;
    }
    const percent = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
    bar.style.width = `${percent}%`;
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
}

/* --------------------------------------------------------------------------
   SCROLL SPY FOR EDITORIAL NAV
   -------------------------------------------------------------------------- */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  function updateActiveLink() {
    const scrollPos = (window.scrollY || document.documentElement.scrollTop) + 120;
    let currentId = '';

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    // If at bottom of page, activate last section
    if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 50) {
      currentId = sections[sections.length - 1].getAttribute('id');
    }

    if (currentId) {
      navLinks.forEach((link) => {
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
}
