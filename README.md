# SnapList AI ⚡ 
> **Open-Source AI Side Hustle: E-Commerce Listing & SEO Optimization Engine**  
> Built for the **DEV Open-Source AI Side Hustle Challenge** • Ready for 1-Click Render Deployment.

[![Render Deploy](https://render.com/images/deploy-to-render-button.svg)](https://render.com)

---

## 💡 The Problem & The Side Hustle Opportunity
Every day, millions of indie creators, Etsy artisans, flea-market pickers, and eBay flippers spend countless hours drafting product titles, guessing SEO tags, and writing descriptions.

While closed proprietary AI tools (e.g., commercial SaaS wrappers) charge $0.02 - $0.06 per listing generation and lock merchants into opaque monthly subscriptions, **these recurring costs erode the thin margins of a side hustle**. Furthermore, merchants are forced to upload unreleased prototype designs, personal inventory notes, and supplier pricing to closed servers that use their data for model training.

**SnapList AI** solves this by putting **open-source AI at the core of the business**:
1. **High-Converting Listings in Seconds:** Generates marketplace-tailored titles, 13 search tags (Etsy algorithm compliant), conversion bullets, SEO terms, and pricing hints.
2. **Open-Weight Autonomy:** Powered by Meta's **Llama 3.2 (3B)**, **Mistral 7B**, and **Qwen 2.5**.
3. **98% Lower Unit Cost:** Reduces generation costs from ~$35/1,000 items to under ~$0.50, ensuring the side hustle is truly profitable from day one.
4. **Data Sovereignty & Offline Option:** Connectable to local Ollama nodes for pickers and sellers sourcing inventory at swap meets with zero internet connectivity.

---

## 🌟 Why Open Innovation Matters Here

### 1. The Economics of Side Hustles
A reseller with 500 new monthly items would pay $200–$400/year to closed API providers. With open weights running via serverless Hugging Face endpoints or local inference, that cost drops to pennies, making the micro-business sustainable.

### 2. No Vendor Lock-In
If one open model changes its weights or licensing, merchants can swap from `Llama-3.2-3B` to `Mistral-7B-Instruct` or `Qwen2.5-7B` with a single toggle. 

### 3. Privacy & Intellectual Property
Independent craftspeople and jewelers protect their proprietary materials and unreleased patterns. Using open models (especially via local Ollama or private containers) guarantees zero data leaks.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ (tested on v26)

### Run Locally
```bash
# 1. Clone repository
git clone https://github.com/your-username/Money.git
cd Money

# 2. Install dependencies
npm install

# 3. (Optional) Set your Hugging Face Access Token in .env
echo "HF_TOKEN=hf_your_token_here" > .env

# 4. Start the server
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** Even without any API key, SnapList AI includes an instant deterministic local heuristic generator, ensuring visitors immediately get functional, beautiful results.

---

## 🌐 Deploying to Render in 5 Minutes

### Method 1: Using Blueprint (`render.yaml`)
1. Push your repository to GitHub.
2. Log into [Render Dashboard](https://dashboard.render.com).
3. Click **New +** -> **Blueprint**.
4. Connect this repository. Render will automatically detect [`render.yaml`](render.yaml) and configure the Web Service on the Free/Starter tier.
5. (Optional) Add your `HF_TOKEN` environment variable under Environment Settings.

### Method 2: Manual Web Service
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment:** Node
- **Port:** Render automatically sets `PORT=10000` (which `server.js` listens to).

---

## 🛠️ Tech Stack
- **Backend:** Node.js, Express, Multer, Native Fetch
- **Frontend:** Vanilla HTML5, Modern Responsive CSS3 (Glassmorphism, custom CSS variables, zero heavy frameworks)
- **Open-Weight Models:**
  - `meta-llama/Llama-3.2-3B-Instruct`
  - `mistralai/Mistral-7B-Instruct-v0.3`
  - `Qwen/Qwen2.5-7B-Instruct`
- **Local / Edge Support:** Ollama, LocalAI, vLLM

---

## 📜 License
MIT License. Open-source, freely forkable, and ready to monetize!
