// SnapList AI - Frontend Interactive Engine
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const form = document.getElementById('listing-form');
  const itemNameInput = document.getElementById('item-name');
  const platformSelect = document.getElementById('platform');
  const categoryInput = document.getElementById('category');
  const conditionSelect = document.getElementById('condition');
  const toneSelect = document.getElementById('tone');
  const targetPriceInput = document.getElementById('target-price');
  const detailsInput = document.getElementById('details');
  const modelSelect = document.getElementById('model-selector');
  const customEndpointInput = document.getElementById('custom-endpoint');
  const userApiKeyInput = document.getElementById('user-api-key');

  const photoDropzone = document.getElementById('photo-dropzone');
  const photoInput = document.getElementById('photo-input');
  const previewContainer = document.getElementById('preview-container');

  const modelToggle = document.getElementById('model-toggle');
  const modelDrawer = document.getElementById('model-drawer');
  const modelChevron = document.getElementById('model-chevron');
  const selectedModelName = document.getElementById('selected-model-name');

  const generateBtn = document.getElementById('generate-btn');
  const btnText = generateBtn.querySelector('.btn-text');
  const spinner = document.getElementById('spinner');

  const emptyState = document.getElementById('empty-state');
  const resultContainer = document.getElementById('result-container');
  const outputMeta = document.getElementById('output-meta');

  // Result display fields
  const resProvider = document.getElementById('res-provider');
  const resLatency = document.getElementById('res-latency');
  const resPricing = document.getElementById('res-pricing');
  const resTitle = document.getElementById('res-title');
  const resAdvice = document.getElementById('res-advice');
  const resTags = document.getElementById('res-tags');
  const resBullets = document.getElementById('res-bullets');
  const resDescription = document.getElementById('res-description');
  const resSeo = document.getElementById('res-seo');

  const copyAllBtn = document.getElementById('copy-all-btn');
  const downloadJsonBtn = document.getElementById('download-json-btn');
  const copyTagsBtn = document.getElementById('copy-tags-btn');
  const toast = document.getElementById('toast');

  // ROI Calculator elements
  const volumeSlider = document.getElementById('volume-slider');
  const sliderNumber = document.getElementById('slider-number');
  const closedCost = document.getElementById('closed-cost');
  const openCost = document.getElementById('open-cost');
  const annualSavings = document.getElementById('annual-savings');

  let currentListingData = null;

  // Toggle model settings drawer
  modelToggle.addEventListener('click', () => {
    modelDrawer.classList.toggle('open');
    modelChevron.classList.toggle('rotate');
  });

  // Update selected model label
  modelSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    const names = {
      llama: 'Llama 3.2 3B',
      mistral: 'Mistral 7B',
      qwen: 'Qwen 2.5 7B'
    };
    selectedModelName.textContent = names[val] || 'Open-Weight';
  });

  // Example Sample Quick Fill Chips
  const samplePresets = {
    pottery: {
      itemName: 'Handmade Speckled Ceramic Matcha Bowl (Chawan)',
      platform: 'Etsy',
      category: 'Home & Living / Kitchen / Ceramics',
      condition: 'Brand New / Handmade',
      tone: 'Vibrant & Story-Driven',
      targetPrice: '$54.00',
      details: 'Hand-thrown stoneware clay, food-safe rustic celadon glaze, 14oz volume, organic bamboo chasen included.'
    },
    vintage: {
      itemName: 'Vintage 1979 Sony Walkman TPS-L2 Portable Cassette Player',
      platform: 'eBay',
      category: 'Consumer Electronics / Vintage Audio',
      condition: 'Vintage / Pre-owned (Like New)',
      tone: 'Collector & Provenance Focused',
      targetPrice: '$320.00',
      details: 'New belts installed, fully tested playback & rewind, crisp audio, original dual headphone jacks intact, clean battery compartment.'
    },
    leather: {
      itemName: 'Heritage Full-Grain Leather 15-inch Messenger Bag',
      platform: 'Shopify',
      category: 'Bags & Luggage / Leather Goods',
      condition: 'Brand New / Handmade',
      tone: 'Minimalist & Modern',
      targetPrice: '$168.00',
      details: 'Vegetable-tanned saddle leather, brass YKK zippers, padded laptop compartment, develops rich patina over time.'
    }
  };

  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const sampleKey = chip.getAttribute('data-sample');
      const data = samplePresets[sampleKey];
      if (data) {
        itemNameInput.value = data.itemName;
        platformSelect.value = data.platform;
        categoryInput.value = data.category;
        conditionSelect.value = data.condition;
        toneSelect.value = data.tone;
        targetPriceInput.value = data.targetPrice;
        detailsInput.value = data.details;
        showToast(`Loaded "${data.itemName}" sample!`);
      }
    });
  });

  // Photo dropzone interactions
  photoDropzone.addEventListener('click', (e) => {
    if (e.target !== photoInput) {
      photoInput.click();
    }
  });

  photoDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    photoDropzone.style.borderColor = '#10b981';
  });

  photoDropzone.addEventListener('dragleave', () => {
    photoDropzone.style.borderColor = 'rgba(255, 255, 255, 0.12)';
  });

  photoDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    photoDropzone.style.borderColor = 'rgba(255, 255, 255, 0.12)';
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      photoInput.files = e.dataTransfer.files;
      renderImagePreviews(e.dataTransfer.files);
    }
  });

  photoInput.addEventListener('change', () => {
    if (photoInput.files && photoInput.files.length > 0) {
      renderImagePreviews(photoInput.files);
    }
  });

  function renderImagePreviews(files) {
    previewContainer.innerHTML = '';
    const maxFiles = Math.min(files.length, 4);
    for (let i = 0; i < maxFiles; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.src = e.target.result;
          img.className = 'preview-thumb';
          previewContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  // Handle Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const itemName = itemNameInput.value.trim();
    if (!itemName) return;

    // Loading state
    btnText.textContent = 'Generating with Open AI...';
    spinner.classList.remove('hidden');
    generateBtn.disabled = true;

    const formData = new FormData(form);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Server returned an error');
      }

      currentListingData = result.listing;
      displayListing(result.listing);
      showToast('Optimized listing generated successfully!');
    } catch (err) {
      console.error(err);
      alert('Generation failed: ' + err.message);
    } finally {
      btnText.textContent = 'Generate Optimized Listing';
      spinner.classList.add('hidden');
      generateBtn.disabled = false;
    }
  });

  // Display Listing in the Output Panel
  function displayListing(listing) {
    const data = listing.data;

    emptyState.classList.add('hidden');
    resultContainer.classList.remove('hidden');

    outputMeta.textContent = `Optimized for ${listing.platform} • Generated via ${listing.modelUsed}`;
    resProvider.textContent = `Engine: ${listing.provider}`;
    resLatency.textContent = `⚡ ${listing.inferenceTimeMs}ms`;
    resPricing.textContent = `Suggested: ${data.suggestedPriceRange || '$35 - $60'}`;

    resTitle.textContent = data.title || `${listing.itemName} - Premium Condition`;
    resAdvice.textContent = data.platformAdvice || `Algorithm Tip: Keep titles keyword-dense and prioritize clear dimensions.`;

    // Render tags
    resTags.innerHTML = '';
    const tags = Array.isArray(data.tags) ? data.tags : [];
    tags.forEach(tag => {
      const badge = document.createElement('span');
      badge.className = 'tag-badge';
      badge.textContent = `#${tag}`;
      badge.title = 'Click to copy tag';
      badge.addEventListener('click', () => {
        copyText(tag);
        showToast(`Tag copied: "${tag}"`);
      });
      resTags.appendChild(badge);
    });

    // Render bullet points
    resBullets.innerHTML = '';
    const bullets = Array.isArray(data.bulletPoints) ? data.bulletPoints : [];
    bullets.forEach(b => {
      const li = document.createElement('li');
      li.textContent = b;
      resBullets.appendChild(li);
    });

    // Render description
    resDescription.textContent = data.description || '';

    // Render SEO keywords
    resSeo.innerHTML = '';
    const seoList = Array.isArray(data.seoKeywords) ? data.seoKeywords : [];
    seoList.forEach(k => {
      const span = document.createElement('span');
      span.className = 'seo-chip';
      span.textContent = `🔍 ${k}`;
      resSeo.appendChild(span);
    });

    // Scroll output card into view on small screens
    if (window.innerWidth < 960) {
      resultContainer.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Copy Buttons for individual sections
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy');
      const el = document.getElementById(targetId);
      if (el) {
        copyText(el.innerText || el.textContent);
        showToast('Section copied to clipboard!');
      }
    });
  });

  // Copy all tags joined by comma
  copyTagsBtn.addEventListener('click', () => {
    if (!currentListingData || !currentListingData.data.tags) return;
    const tagString = currentListingData.data.tags.join(', ');
    copyText(tagString);
    showToast('All 13 search tags copied to clipboard!');
  });

  // Copy All button
  copyAllBtn.addEventListener('click', () => {
    if (!currentListingData) {
      showToast('Generate a listing first!');
      return;
    }
    const d = currentListingData.data;
    const fullText = `TITLE:
${d.title}

SUGGESTED PRICE:
${d.suggestedPriceRange}

KEY FEATURES:
${(d.bulletPoints || []).map(b => '• ' + b).join('\n')}

DESCRIPTION:
${d.description}

TAGS:
${(d.tags || []).join(', ')}

SEO SEARCH TERMS:
${(d.seoKeywords || []).join(', ')}
`;
    copyText(fullText);
    showToast('Full formatted listing copied to clipboard!');
  });

  // Download JSON
  downloadJsonBtn.addEventListener('click', () => {
    if (!currentListingData) {
      showToast('Generate a listing first!');
      return;
    }
    const blob = new Blob([JSON.stringify(currentListingData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `listing-${currentListingData.itemName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Listing JSON downloaded!');
  });

  // Interactive ROI Calculator Logic
  function updateSavings(vol) {
    sliderNumber.textContent = Number(vol).toLocaleString();

    const closedRate = 0.035; // $35 / 1000 items
    const openRate = 0.0008; // fraction of a cent on open serverless / local

    const closed = vol * closedRate;
    const open = vol * openRate;
    const annual = (closed - open) * 12;

    closedCost.textContent = `$${closed.toFixed(2)} /mo`;
    openCost.textContent = `$${open.toFixed(2)} /mo`;
    annualSavings.textContent = `$${annual.toFixed(2)} / year`;
  }

  volumeSlider.addEventListener('input', (e) => {
    updateSavings(e.target.value);
  });
  updateSavings(500);

  // Helper copy function
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }

  // Toast notification
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }
});
