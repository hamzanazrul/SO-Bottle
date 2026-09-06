/**
 * SO BOTTOL - Interactive Live Bottle Customizer
 * Coordinates 3D real-time rendering, label text/slogan, 360-rotation, and cap colors.
 */

window.CustomizerState = {
  name: "YOUR NAME",
  slogan: "STAY PURE • STAY HYDRATED",
  capColor: "#00a8ff",
  capName: "Ice Blue",
  font: "'Hind Siliguri', 'Syne', sans-serif",
  size: "750ml"
};

function initCustomizer() {
  const nameInput = document.getElementById('cust-name-input');
  const sloganInput = document.getElementById('cust-slogan-input');
  const sizeRadios = document.querySelectorAll('input[name="bottle-size"]');
  const capButtons = document.querySelectorAll('.cap-swatch-btn');
  const fontSelect = document.getElementById('cust-font-select');
  const presetPills = document.querySelectorAll('.preset-pill');

  // Name input listener (Supports Bengali & English)
  if (nameInput) {
    nameInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      window.CustomizerState.name = val.length > 0 ? val : "YOUR NAME";
      sync3DBottle();
      updateOrderModalSummary();
    });
  }

  // Slogan input listener (Supports Bengali & English)
  if (sloganInput) {
    sloganInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      window.CustomizerState.slogan = val.length > 0 ? val : "STAY PURE • STAY HYDRATED";
      sync3DBottle();
      updateOrderModalSummary();
    });
  }

  // Cap Color Swatches
  capButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      capButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const color = btn.getAttribute('data-color');
      const name = btn.getAttribute('data-name') || color;
      window.CustomizerState.capColor = color;
      window.CustomizerState.capName = name;

      // Update 3D Cap Color
      applyCapColor(color);
      updateOrderModalSummary();
    });
  });

  // Font Selection
  if (fontSelect) {
    fontSelect.addEventListener('change', (e) => {
      window.CustomizerState.font = e.target.value;
      sync3DBottle();
    });
  }

  // Bottle Size Selection
  sizeRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      if (e.target.checked) {
        window.CustomizerState.size = e.target.value;
        updateOrderModalSummary();
      }
    });
  });

  // Preset Inspiration Pills
  presetPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      presetPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const name = pill.getAttribute('data-name');
      const slogan = pill.getAttribute('data-slogan');
      const cap = pill.getAttribute('data-cap');

      if (name && nameInput) {
        nameInput.value = name;
        window.CustomizerState.name = name;
      }
      if (slogan && sloganInput) {
        sloganInput.value = slogan;
        window.CustomizerState.slogan = slogan;
      }
      if (cap) {
        const matchingBtn = document.querySelector(`.cap-swatch-btn[data-color="${cap}"]`);
        if (matchingBtn) matchingBtn.click();
      }

      sync3DBottle();
      updateOrderModalSummary();

      // Trigger Three.js splash burst for celebratory feedback
      triggerSplashBurstGlobal();
    });
  });

  // Initial Sync after brief delay to let 3D scenes mount
  setTimeout(() => {
    sync3DBottle();
    applyCapColor(window.CustomizerState.capColor);
  }, 200);
}

function sync3DBottle() {
  const state = window.CustomizerState;
  
  // Update Customizer 3D Bottle
  if (window.bottleScenes && window.bottleScenes.customizer) {
    window.bottleScenes.customizer.setCustomText(state.name, state.slogan);
  }

  // Also update SVG fallback if any exists
  const labelTextElem = document.getElementById('label-custom-text');
  const labelSloganElem = document.getElementById('label-custom-slogan');
  if (labelTextElem) labelTextElem.textContent = state.name;
  if (labelSloganElem) labelSloganElem.textContent = state.slogan;
}

function applyCapColor(hex) {
  // Update 3D Cap Color
  if (window.bottleScenes && window.bottleScenes.customizer) {
    window.bottleScenes.customizer.setCapColor(hex);
  }

  // Update cap name label on UI
  const capLabel = document.getElementById('selected-cap-name');
  if (capLabel && window.CustomizerState) {
    capLabel.textContent = window.CustomizerState.capName;
  }
}

function triggerSplashBurstGlobal() {
  if (window.bottleScenes) {
    if (window.bottleScenes.customizer) window.bottleScenes.customizer.triggerSplashBurst();
    if (window.bottleScenes.hero) window.bottleScenes.hero.triggerSplashBurst();
  }
}

function updateOrderModalSummary() {
  const state = window.CustomizerState;
  const sumName = document.getElementById('modal-summary-name');
  const sumSlogan = document.getElementById('modal-summary-slogan');
  const sumCap = document.getElementById('modal-summary-cap');
  const sumSize = document.getElementById('modal-summary-size');
  const capDot = document.getElementById('modal-summary-cap-dot');

  if (sumName) sumName.textContent = state.name;
  if (sumSlogan) sumSlogan.textContent = state.slogan;
  if (sumCap) sumCap.textContent = state.capName;
  if (sumSize) sumSize.textContent = state.size.toUpperCase();
  if (capDot) capDot.style.backgroundColor = state.capColor;

  // Hidden form inputs for checkout
  const inputCustomText = document.getElementById('order-custom-text');
  const inputCapColor = document.getElementById('order-cap-color');
  const inputSize = document.getElementById('order-bottle-size');

  if (inputCustomText) inputCustomText.value = `${state.name} (${state.slogan})`;
  if (inputCapColor) inputCapColor.value = `${state.capName} (${state.capColor})`;
  if (inputSize) inputSize.value = state.size;
}

window.addEventListener('DOMContentLoaded', initCustomizer);
