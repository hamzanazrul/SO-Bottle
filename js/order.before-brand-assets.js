/**
 * SO BOTTOL - Pure Static Swiper 3D Coverflow & Multi-Size Dynamic Price Engine
 * Target WhatsApp: 01884276242 (+8801884276242)
 */

const WHATSAPP_NUMBER = "8801884276242";

// Bottle Catalog with Specs & Base Prices (500 ML)
const BOTTLE_CATALOG = {
  b1: {
    id: 'b1',
    name: 'Blue Hydration Fuel',
    tag: 'HYDRO WAVE',
    basePrice: 220,
    image: 'assets/images/b1.jpg',
    desc: 'ক্রিস্টাল ক্লিয়ার সিলিন্ডার বডি, ওয়েভ টেক্সচার্ড ব্লু লেবেলিং এবং হাই-প্রেশার স্প্ল্যাশ প্রটেক্টেড আইস ব্লু ক্যাপ।'
  },
  b2: {
    id: 'b2',
    name: 'Aqua Premium Natural',
    tag: 'ERGONOMIC CURVE',
    basePrice: 250,
    image: 'assets/images/b2.jpg',
    desc: 'প্রাকৃতিক স্প্রিং ওয়াটার থিম, এরগনোমিক গ্রিপ স্পাইরাল কনট্যুর বডি এবং রয়েল ম্যাট ব্ল্যাক প্রফেশনাল ক্যাপ।'
  },
  b3: {
    id: 'b3',
    name: 'TOCE Alpine Glacier',
    tag: 'SPARKLING MINERAL',
    basePrice: 280,
    image: 'assets/images/b3.jpg',
    desc: 'আলপাইন গ্লেসিয়ার মাউন্টেন পিক শেপড গ্রেডিয়েন্ট লেবেল, প্রিমিয়াম রিজিড গ্লাস-লাইক ফিনিশ এবং হেভি-ডিউটি ক্যাপ।'
  }
};

// Size Catalog with Extra Incremental Pricing
const SIZE_CATALOG = {
  '500ml': { name: '500 ML (হাফ লিটার)', addPrice: 0, badgeText: '৫০০ মিলি (হাফ লিটার)' },
  '750ml': { name: '750 ML (স্পোর্টস সাইজ)', addPrice: 50, badgeText: '৭৫০ মিলি (স্পোর্টস সাইজ)' },
  '1000ml': { name: '1000 ML (১ লিটার)', addPrice: 100, badgeText: '১০০০ মিলি (১ লিটার)' },
  '5000ml': { name: '5000 ML (৫ লিটার জার)', addPrice: 350, badgeText: '৫০০০ মিলি (৫ লিটার জার)' }
};

// Global Order State
let currentOrderState = {
  bottleId: 'b2',
  sizeKey: '1000ml',
  quantity: 5,
  labelName: 'YOUR NAME',
  slogan: 'STAY PURE • STAY HYDRATED'
};

document.addEventListener('DOMContentLoaded', () => {
  initCoverflowSlider();
  initOrderEngine();
  updateLiveOrderCalculations();
});

/**
 * 1. Initialize Simple & Smooth Bottle Carousel
 */
function initCoverflowSlider() {
  const track = document.querySelector('.bottle-coverflow-swiper .swiper-wrapper');
  if (!track) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const move = direction => track.scrollBy({left: direction * (track.firstElementChild.getBoundingClientRect().width + 24), behavior: reduced.matches ? 'instant' : 'smooth'});
  document.querySelector('.swiper-button-next')?.addEventListener('click', () => move(1));
  document.querySelector('.swiper-button-prev')?.addEventListener('click', () => move(-1));
  track.setAttribute('tabindex', '0');
  track.setAttribute('aria-label', 'বোতল কালেকশন');
  track.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
}

/**
 * 2. Select Bottle from Slideshow or Quick Button and smooth scroll to Order Form
 */
function selectBottleForOrder(bottleId) {
  if (!BOTTLE_CATALOG[bottleId]) return;

  currentOrderState.bottleId = bottleId;
  const radio = document.querySelector(`input[name="order_bottle_model"][value="${bottleId}"]`);
  if (radio) radio.checked = true;

  updateLiveOrderCalculations();

  const orderSection = document.getElementById('order-section');
  if (orderSection) {
    orderSection.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }
}

/**
 * 3. Initialize Interactive Order Form & Event Listeners
 */
function initOrderEngine() {
  // Bottle Model Radio Changes
  const modelRadios = document.querySelectorAll('input[name="order_bottle_model"]');
  modelRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      currentOrderState.bottleId = e.target.value;
      updateLiveOrderCalculations();
    });
  });

  // Size Radio Changes
  const sizeRadios = document.querySelectorAll('input[name="order_size"]');
  sizeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      currentOrderState.sizeKey = e.target.value;
      updateLiveOrderCalculations();
    });
  });

  // Quantity Counter Buttons
  const minusBtn = document.getElementById('qty-minus-btn');
  const plusBtn = document.getElementById('qty-plus-btn');
  const qtyInput = document.getElementById('order-cust-qty');

  if (minusBtn && plusBtn && qtyInput) {
    minusBtn.addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 5;
      if (val > 5) {
        val -= 1;
        qtyInput.value = val;
        currentOrderState.quantity = val;
        updateLiveOrderCalculations();
      } else {
        alert("ন্যূনতম অর্ডারের পরিমাণ ৫ কেসিং। ৫ কেসিংয়ের কম অর্ডার করা সম্ভব নয়।");
      }
    });

    plusBtn.addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 5;
      if (val < 500) {
        val += 1;
        qtyInput.value = val;
        currentOrderState.quantity = val;
        updateLiveOrderCalculations();
      }
    });
  }

  // Live Typing into Label Name & Slogan
  const nameInput = document.getElementById('order-label-name');
  const sloganInput = document.getElementById('order-label-slogan');

  if (nameInput) {
    nameInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      currentOrderState.labelName = val ? val : 'YOUR NAME';
      const display = document.getElementById('preview-name-display');
      if (display) display.textContent = currentOrderState.labelName;
    });
  }

  if (sloganInput) {
    sloganInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      currentOrderState.slogan = val ? val : 'STAY PURE • STAY HYDRATED';
      const display = document.getElementById('preview-slogan-display');
      if (display) display.textContent = currentOrderState.slogan;
    });
  }

  // Handle Order Submit
  const orderForm = document.getElementById('direct-order-form');
  if (orderForm) {
    orderForm.addEventListener('submit', handleDirectOrderSubmit);
  }
}

/**
 * 4. Real-time Calculation of Prices & Updating UI
 */
function updateLiveOrderCalculations() {
  const bottle = BOTTLE_CATALOG[currentOrderState.bottleId] || BOTTLE_CATALOG.b2;
  const size = SIZE_CATALOG[currentOrderState.sizeKey] || SIZE_CATALOG['1000ml'];
  let qty = parseInt(document.getElementById('order-cust-qty')?.value) || currentOrderState.quantity || 5;
  if (qty < 5) qty = 5;
  currentOrderState.quantity = qty;

  // Pricing formula: Base Price (for 500ml) + Incremental Size Price
  const unitPrice = bottle.basePrice + size.addPrice;
  const totalPrice = unitPrice * qty;

  // 1. Update Preview Image
  const previewImg = document.getElementById('preview-bottle-img');
  if (previewImg && previewImg.getAttribute('src') !== bottle.image) {
    previewImg.src = bottle.image;
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      previewImg.animate([{opacity:.65}, {opacity:1}], {duration:220, easing:'ease-out'});
    }
  }

  // 2. Update Preview Badge Tags
  const previewSizeTag = document.getElementById('preview-size-tag');
  if (previewSizeTag) previewSizeTag.textContent = size.badgeText;

  const previewNameDisplay = document.getElementById('preview-name-display');
  if (previewNameDisplay) {
    const val = document.getElementById('order-label-name')?.value.trim();
    previewNameDisplay.textContent = val ? val : currentOrderState.labelName;
  }

  const previewSloganDisplay = document.getElementById('preview-slogan-display');
  if (previewSloganDisplay) {
    const val = document.getElementById('order-label-slogan')?.value.trim();
    previewSloganDisplay.textContent = val ? val : currentOrderState.slogan;
  }

  // 3. Update Summary Rows
  const summaryModel = document.getElementById('summary-model-name');
  if (summaryModel) summaryModel.textContent = bottle.name;

  const summarySize = document.getElementById('summary-size-name');
  if (summarySize) summarySize.textContent = size.name;

  const summaryUnit = document.getElementById('summary-unit-price');
  if (summaryUnit) summaryUnit.textContent = `৳ ${unitPrice}`;

  const summaryQty = document.getElementById('summary-quantity');
  if (summaryQty) summaryQty.textContent = `${qty} কেসিং (ন্যূনতম ৫)`;

  const summaryTotal = document.getElementById('summary-total-price');
  if (summaryTotal) summaryTotal.textContent = `৳ ${totalPrice}`;

  const btnTotal = document.getElementById('btn-total-display');
  if (btnTotal) btnTotal.textContent = `৳ ${totalPrice}`;
}

/**
 * 5. Handle WhatsApp Form Submission
 */
function handleDirectOrderSubmit(e) {
  e.preventDefault();

  const custName = document.getElementById('order-cust-name').value.trim();
  const custPhone = document.getElementById('order-cust-phone').value.trim();
  const custAddress = document.getElementById('order-cust-address').value.trim();
  const custCity = document.getElementById('order-cust-city').value.trim();
  const notes = document.getElementById('order-cust-notes').value.trim();

  if (!custName || !custPhone || !custAddress || !custCity) {
    alert("অনুগ্রহ করে আপনার নাম, মোবাইল নম্বর, পূর্ণ ঠিকানা এবং জেলা/শহর পূরণ করুন।");
    return;
  }

  const bottle = BOTTLE_CATALOG[currentOrderState.bottleId] || BOTTLE_CATALOG.b2;
  const size = SIZE_CATALOG[currentOrderState.sizeKey] || SIZE_CATALOG['1000ml'];
  let qty = parseInt(document.getElementById('order-cust-qty').value) || 5;
  if (qty < 5) {
    alert("ন্যূনতম অর্ডারের পরিমাণ ৫ কেসিং। অনুগ্রহ করে কমপক্ষে ৫ কেসিং সিলেক্ট করুন।");
    document.getElementById('order-cust-qty').value = 5;
    currentOrderState.quantity = 5;
    updateLiveOrderCalculations();
    return;
  }
  const unitPrice = bottle.basePrice + size.addPrice;
  const totalPrice = unitPrice * qty;

  const labelName = document.getElementById('order-label-name').value.trim() || "YOUR NAME";
  const slogan = document.getElementById('order-label-slogan').value.trim() || "STAY PURE";

  const now = new Date();
  const formattedDate = now.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) + ' | ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Format High-End Structured WhatsApp Message
  const message = 
`💧 *নতুন অর্ডার রিকোয়েস্ট - SO BOTTOL* 💧
═════════════════════════
👤 *গ্রাহকের বিবরণ:*
• নাম: ${custName}
• মোবাইল: ${custPhone}
• ঠিকানা: ${custAddress}, ${custCity}

🍾 *নির্বাচিত বোতলের বিবরণ:*
• মডেল: *${bottle.name}* (${bottle.tag})
• বোতলের সাইজ: *${size.name}*
• বোতলের গায়ে নাম: *${labelName}*
• সাবটেক্সট / স্লোগান: "${slogan}"
• এককের মূল্য: ৳ ${unitPrice} / কেসিং
• মোট পরিমাণ: *${qty} কেসিং* (ন্যূনতম ৫ কেসিং)
• *সর্বমোট প্রদেয় মূল্য:* *৳ ${totalPrice}*

📝 *বিশেষ কোনো নির্দেশনা:*
• ${notes ? notes : 'কোনো বিশেষ নির্দেশনা নেই'}

═════════════════════════
📅 অর্ডারের সময়: ${formattedDate}
🚀 *SO Bottol* | Pure Hydration, Custom Identity`;

  // Encode URL & Open WhatsApp
  const encodedText = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;

  window.open(whatsappUrl, '_blank');
}
