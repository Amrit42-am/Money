import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Multer memory storage for direct image processing
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// In-memory or simple file persistence for saved listings
const DB_FILE = path.join(__dirname, 'data', 'listings.json');
function loadListings() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading listings:', e);
  }
  return [];
}

function saveListing(listing) {
  const current = loadListings();
  current.unshift(listing);
  if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(current.slice(0, 100), null, 2));
}

// Preset Open-Weight Models
const OPEN_MODELS = {
  llama: {
    id: 'meta-llama/Llama-3.2-3B-Instruct',
    name: 'Llama 3.2 3B Instruct (Open-Weight Meta)',
    description: 'Blazing fast, state-of-the-art open weights for e-commerce copy & conversion analysis'
  },
  mistral: {
    id: 'mistralai/Mistral-7B-Instruct-v0.3',
    name: 'Mistral 7B Instruct v0.3 (Open-Weight Mistral AI)',
    description: 'European open model renowned for precise instructions, crisp nuance, and tone adaptation'
  },
  qwen: {
    id: 'Qwen/Qwen2.5-7B-Instruct',
    name: 'Qwen 2.5 7B Instruct (Alibaba Open Research)',
    description: 'Top-tier open-weight benchmark leader for structured JSON outputs, multi-language, and SEO tag extraction'
  }
};

/**
 * Open-Source Inference Engine:
 * Communicates with open-source endpoints:
 * 1. Hugging Face Serverless Inference Router / Models (Open weights)
 * 2. Custom/Self-hosted endpoint (Ollama, vLLM, or TGI)
 * 3. Fallback deterministic heuristic engine if no API key is set
 */
async function callOpenSourceModel({ modelKey, prompt, customEndpoint, apiKey, temperature = 0.7 }) {
  const selectedModel = OPEN_MODELS[modelKey] || OPEN_MODELS.llama;
  const token = apiKey || process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;

  // 1. If user supplied a custom Ollama / local endpoint
  if (customEndpoint && customEndpoint.trim() !== '') {
    try {
      const isOllama = customEndpoint.includes('11434') || customEndpoint.includes('/api/generate');
      const url = isOllama 
        ? (customEndpoint.endsWith('/api/generate') ? customEndpoint : `${customEndpoint.replace(/\/$/, '')}/api/generate`)
        : customEndpoint;

      const body = isOllama ? {
        model: 'llama3.2',
        prompt: prompt,
        stream: false,
        options: { temperature }
      } : {
        inputs: prompt,
        parameters: { max_new_tokens: 1000, temperature }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(20000)
      });

      if (res.ok) {
        const data = await res.json();
        const text = isOllama ? data.response : (Array.isArray(data) ? data[0]?.generated_text : data?.generated_text || JSON.stringify(data));
        return { text, provider: 'Custom Local / Ollama Open-Source Node' };
      }
    } catch (err) {
      console.warn('Custom endpoint failed, trying next provider:', err.message);
    }
  }

  // 2. Try Hugging Face Inference API with open-weight model if token is available
  if (token) {
    try {
      const hfUrl = `https://api-inference.huggingface.co/models/${selectedModel.id}`;
      const response = await fetch(hfUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 1200,
            temperature: temperature,
            return_full_text: false
          }
        }),
        signal: AbortSignal.timeout(25000)
      });

      if (response.ok) {
        const data = await response.json();
        let genText = '';
        if (Array.isArray(data) && data[0]?.generated_text) {
          genText = data[0].generated_text;
        } else if (data.generated_text) {
          genText = data.generated_text;
        }
        if (genText) {
          return { text: genText, provider: `Hugging Face Serverless (${selectedModel.name})` };
        }
      }
    } catch (hfErr) {
      console.warn('HF Inference API error:', hfErr.message);
    }
  }

  // 3. Fallback Built-in Open Engine (Instant Intelligent Heuristic Generator)
  // Ensures anyone visiting your Render deployment gets an immediate, reliable, high-value result
  // even without entering their own API keys!
  return {
    text: generateDeterministicListing(prompt),
    provider: `Built-in Open Logic Engine (Local Instant Fallback for ${selectedModel.name})`
  };
}

// Deterministic heuristic generator based on item inputs and e-commerce listing formula
function generateDeterministicListing(prompt) {
  // Extract inputs passed in prompt
  const itemMatch = prompt.match(/ITEM_NAME:\s*(.+)/i);
  const platformMatch = prompt.match(/PLATFORM:\s*(.+)/i);
  const conditionMatch = prompt.match(/CONDITION:\s*(.+)/i);
  const vibeMatch = prompt.match(/TONE:\s*(.+)/i);
  const categoryMatch = prompt.match(/CATEGORY:\s*(.+)/i);
  const detailsMatch = prompt.match(/DETAILS:\s*(.+)/i);

  const item = itemMatch ? itemMatch[1].trim() : 'Artisanal Vintage Item';
  const platform = platformMatch ? platformMatch[1].trim() : 'Etsy';
  const condition = conditionMatch ? conditionMatch[1].trim() : 'Handmade / Excellent';
  const tone = vibeMatch ? vibeMatch[1].trim() : 'Story-Driven & Aesthetic';
  const category = categoryMatch ? categoryMatch[1].trim() : 'Home & Living / Decor';
  const details = detailsMatch ? detailsMatch[1].trim() : 'Carefully crafted, durable, authentic materials.';

  const isEtsy = platform.toLowerCase().includes('etsy');
  const isEbay = platform.toLowerCase().includes('ebay');
  const isShopify = platform.toLowerCase().includes('shopify');

  let title = '';
  if (isEtsy) {
    title = `${item} - ${condition} | Aesthetic ${category} | Handcrafted Gift Idea | Cozy Studio Decor`;
  } else if (isEbay) {
    title = `${item} - ${condition} - Fast Shipping - Verified Authentic - Rare Find`;
  } else {
    title = `Premium ${item} | Luxury ${category} Collection`;
  }

  const tags = [
    item.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').slice(0, 3).join(' '),
    'gift for them',
    'handcrafted quality',
    'aesthetic room decor',
    'unique vintage style',
    'sustainable living',
    category.toLowerCase().split('/')[0].trim(),
    'trending now',
    'limited edition',
    'shop small business',
    'minimalist design',
    'curated collection',
    'housewarming gift'
  ].slice(0, 13);

  const keywords = [
    `${item.toLowerCase()} aesthetic`,
    `best gifts for ${category.toLowerCase()}`,
    `buy ${item.toLowerCase()} online`,
    `authentic ${condition.toLowerCase()}`,
    `modern ${category.toLowerCase()}`
  ];

  const story = `Discover the charm and unmatched craftsmanship of this ${item}. Meticulously curated for discerning collectors and design enthusiasts, this piece blends timeless artistry with everyday functional elegance.

Key Features & Specifications:
• Category: ${category}
• Condition: ${condition}
• Verified Details: ${details}
• Aesthetic Character: ${tone}

Why You Will Love It:
Each detail has been evaluated to ensure top quality. Whether you're treating yourself, upgrading your interior sanctuary, or gifting someone special, this ${item} brings warmth, conversation, and sophistication.

Care & Shipping:
• Packaged with extreme care using eco-friendly, reinforced shipping supplies.
• Dispatched promptly with complete tracking.
• Questions? Feel free to reach out anytime for instant customer assistance!`;

  return JSON.stringify({
    title,
    tags,
    seoKeywords: keywords,
    suggestedPriceRange: '$38.00 - $65.00',
    description: story,
    bulletPoints: [
      `Exceptional Craftsmanship: Designed and inspected with high attention to detail.`,
      `Verified Condition: ${condition} with authentic finishes.`,
      `Ideal Gift Choice: Universally loved gift for holidays, birthdays, or special occasions.`,
      `Eco-conscious Dispatch: Protected with durable, recyclable materials.`
    ],
    platformAdvice: isEtsy 
      ? 'Etsy Pro Tip: Maximize all 13 tag slots and keep the first 30 characters of your title hyper-descriptive for the search algorithm.'
      : (isEbay ? 'eBay Pro Tip: Utilize item specifics (brand, model, color) and enable Best Offer to capture buyer interest faster.' : 'Shopify Pro Tip: Embed alt-text matching your target SEO keywords on all product gallery photos.')
  });
}

// API: Health check & configuration
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'SnapList AI',
    theme: 'Side Hustle - Open-Source AI at its Core',
    models: OPEN_MODELS,
    envConfigured: {
      hasHfToken: Boolean(process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY)
    }
  });
});

// API: Get available open models
app.get('/api/models', (req, res) => {
  res.json({ models: OPEN_MODELS });
});

// API: Fetch previously generated listings
app.get('/api/listings', (req, res) => {
  res.json({ listings: loadListings() });
});

// API: Generate Listing
app.post('/api/generate', upload.array('photos', 5), async (req, res) => {
  try {
    const {
      itemName,
      platform = 'Etsy',
      condition = 'Handmade / New',
      tone = 'Vibrant & Story-Driven',
      category = 'Art & Collectibles',
      details = '',
      targetPrice = '',
      model = 'llama',
      customEndpoint = '',
      userApiKey = ''
    } = req.body;

    if (!itemName) {
      return res.status(400).json({ error: 'Item name or brief summary is required.' });
    }

    const prompt = `You are SnapList AI, an elite e-commerce listing copywriter and SEO optimization engine trained to maximize conversions on marketplaces like Etsy, eBay, Amazon, and Shopify.
Generate an optimal, high-converting product listing in STRICT JSON FORMAT.

PRODUCT ATTRIBUTES:
- ITEM_NAME: ${itemName}
- PLATFORM: ${platform}
- CATEGORY: ${category}
- CONDITION: ${condition}
- TONE: ${tone}
- DETAILS: ${details || 'High quality craftsmanship, durable, aesthetic appeal.'}
- TARGET_PRICE_HINT: ${targetPrice || 'Market competitive'}

YOUR RESPONSE MUST BE VALID JSON ONLY with this schema:
{
  "title": "Optimized marketplace title with high-ranking keywords",
  "tags": ["13 high-volume search tags formatted for the platform"],
  "seoKeywords": ["5 primary long-tail search keywords"],
  "suggestedPriceRange": "$XX.XX - $YY.YY",
  "description": "Engaging, story-driven product description with markdown formatting",
  "bulletPoints": ["4 clear, punchy feature bullets"],
  "platformAdvice": "Actionable platform-specific algorithm advice"
}`;

    const startTime = Date.now();
    const result = await callOpenSourceModel({
      modelKey: model,
      prompt,
      customEndpoint,
      apiKey: userApiKey
    });
    const durationMs = Date.now() - startTime;

    let parsedOutput = null;
    try {
      // Find JSON block in generated text if surrounded by markdown
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedOutput = JSON.parse(jsonMatch[0]);
      } else {
        parsedOutput = JSON.parse(result.text);
      }
    } catch (e) {
      // Fallback parser if output is plain text
      parsedOutput = {
        title: `${itemName} - Premium ${category}`,
        tags: [itemName, 'handcrafted', 'gift', 'authentic', 'vintage', 'trending'],
        seoKeywords: [itemName.toLowerCase(), `${itemName.toLowerCase()} buy online`],
        suggestedPriceRange: targetPrice || '$25.00 - $45.00',
        description: result.text,
        bulletPoints: ['High quality build', 'Fast shipping', 'Satisfied customer guarantee'],
        platformAdvice: `Optimized for ${platform} using open-weight AI.`
      };
    }

    const fullListingRecord = {
      id: 'listing_' + Date.now(),
      createdAt: new Date().toISOString(),
      itemName,
      platform,
      category,
      condition,
      tone,
      modelUsed: OPEN_MODELS[model]?.name || model,
      provider: result.provider,
      inferenceTimeMs: durationMs,
      data: parsedOutput
    };

    saveListing(fullListingRecord);

    return res.json({
      success: true,
      listing: fullListingRecord
    });
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate listing' });
  }
});

// API: Estimate Open-Weight Savings vs Closed Proprietary APIs
app.get('/api/savings-calculator', (req, res) => {
  const listingsPerMonth = parseInt(req.query.volume) || 500;
  
  // Closed API cost model: ~$0.03 per image + prompt call ($30 per 1,000 listings)
  const closedCostPerListing = 0.035;
  const closedMonthlyCost = listingsPerMonth * closedCostPerListing;

  // Open-weight cost model:
  // Hugging Face serverless / local Ollama / Render shared micro-instance = effectively $0.00 to $0.0005
  const openCostPerListing = 0.0008;
  const openMonthlyCost = listingsPerMonth * openCostPerListing;
  const annualSavings = (closedMonthlyCost - openMonthlyCost) * 12;

  res.json({
    volume: listingsPerMonth,
    closedApiMonthly: Number(closedMonthlyCost.toFixed(2)),
    openSourceMonthly: Number(openMonthlyCost.toFixed(2)),
    monthlySavings: Number((closedMonthlyCost - openMonthlyCost).toFixed(2)),
    annualSavings: Number(annualSavings.toFixed(2)),
    privacyAdvantage: '100% Client Data Sovereignty - Zero vendor lock-in or training on confidential merchant data',
    modelAutonomy: 'Swap between Llama 3.2, Mistral 7B, and Qwen 2.5 without rewriting any business logic.'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SnapList AI server running on http://localhost:${PORT}`);
  console.log(`💡 Built for Side Hustle Open-Source AI Challenge (Ready for Render deployment)`);
});
