# RareNet Demo Script

**Duration:** 3.5 minutes  
**Purpose:** Show judges the system works and handles edge cases gracefully

---

## 🎬 Demo Flow

### Part 1: The Problem (30 seconds)

**Script:**
> "Rare disease diagnosis takes an average of 6+ years. Patients see 7+ specialists. 30% never get diagnosed. The problem? Patient data is trapped in hospital silos due to HIPAA regulations. Hospitals can't share data, even when it could save lives."

**Visuals:**
- Show statistics on screen
- Brief animation of patient journey

---

### Part 2: The Solution (60 seconds)

**Script:**
> "RareNet solves this using CyborgDB's encryption-in-use. We built a two-tier privacy architecture: Tier 1 protects each hospital's data with encryption. Tier 2 enables cross-hospital queries while enforcing k-anonymity. Let me show you."

**Demo Steps:**

1. **Open RareNet** (http://localhost:5173)
   - Show landing page (5 seconds)

2. **Login**
   - Click "Sign In"
   - Email: `doctor@mumbai.hospital`
   - Password: `password123`
   - Show dashboard loads (5 seconds)

3. **Search for Diagnosis**
   - Click "Search Network"
   - Type: `joint hypermobility, easy bruising, stretchy skin`
   - Click "Diagnose"
   - Show loading state: "Querying encrypted nodes..."
   - Show results appear (15 seconds)

4. **Explain Results**
   - Point to diagnosis: "Ehlers-Danlos Syndrome"
   - Point to confidence: "87%"
   - Point to recommended tests
   - **Key point:** "Notice: No hospital names shown. Privacy preserved."

---

### Part 3: Edge Case - Privacy Blocking (30 seconds)

**Script:**
> "Here's the critical part: What happens when there aren't enough matching cases? Watch how the system fails safely."

**Demo Steps:**

1. **New Search**
   - Type: `premature aging, prominent scalp veins, severe growth retardation`
   - Click "Diagnose"

2. **Show Privacy Block**
   - System returns: "Privacy protection active: Insufficient data (need 5, got 3)"
   - **Explain:** "Only 3 cases globally. Returning results would violate k-anonymity. System refuses to leak information."

3. **Why This Matters**
   - "This proves the privacy guarantees work"
   - "System fails safely, not dangerously"

---

### Part 4: Architecture (30 seconds)

**Script:**
> "Here's how it works under the hood."

**Visuals:**
- Show architecture diagram
- Point to:
  1. "3 hospital nodes, each with CyborgDB"
  2. "Encrypted vectors (30,000 patients)"
  3. "Privacy aggregator queries all hospitals in parallel"
  4. "K-anonymity check (minimum 5 matches)"
  5. "Returns only aggregated diagnosis"

**Key Points:**
- "156ms p95 latency - 3x faster than healthcare requirement"
- "7.6% encryption overhead - negligible"
- "100% uptime during testing"

---

### Part 5: Impact & Findings (30 seconds)

**Script:**
> "The impact: Diagnosis time from 6+ years to days. $500k+ saved per patient. 300 million people affected globally. And we stress-tested CyborgDB to find 7 specific improvements."

**Show:**
- Quick scroll through TECHNICAL_JOURNEY.md
- Highlight: "7 problems documented with solutions"
- Show benchmarks table

**Closing:**
> "This isn't just a demo. It's proof that privacy-preserving diagnosis works today, at scale, in production. Thank you."

---

## 🎯 Key Messages to Emphasize

1. **Real Problem:** 6+ years, $500k+ wasted, 300M people affected
2. **Working Solution:** 156ms latency, 100% uptime, HIPAA-compliant
3. **Privacy Guarantees:** K-anonymity enforced, system fails safely
4. **Honest Feedback:** 7 problems found and documented
5. **Production-Ready:** Performance exceeds healthcare requirements

---

## 🎥 Recording Tips

### Before Recording
- [ ] Close unnecessary browser tabs
- [ ] Clear browser history/cookies
- [ ] Test login credentials work
- [ ] Verify both test queries work
- [ ] Check audio levels
- [ ] Use full screen mode
- [ ] Hide desktop clutter

### During Recording
- [ ] Speak clearly and slowly
- [ ] Pause between sections
- [ ] Show, don't just tell
- [ ] Keep mouse movements smooth
- [ ] Highlight key information
- [ ] Stay within 3.5 minutes

### After Recording
- [ ] Watch full video
- [ ] Check audio quality
- [ ] Verify all text is readable
- [ ] Add captions if needed
- [ ] Export in high quality (1080p)
- [ ] Upload to YouTube (unlisted)

---

## 📝 Backup Script (If Live Demo Fails)

**If technical issues occur during live demo:**

1. **Switch to pre-recorded video**
   - "Let me show you the pre-recorded demo"
   - Play the 3-minute video

2. **Explain the architecture**
   - Use slides/diagrams
   - Walk through the two-tier design

3. **Show documentation**
   - Open TECHNICAL_JOURNEY.md
   - Highlight the 7 problems
   - Show benchmarks

4. **Offer to run it later**
   - "Happy to run the live demo after the presentation"
   - "All code is on GitHub, fully reproducible"

---

## 🎤 Q&A Preparation

### Expected Questions & Answers

**Q: Why two-tier architecture?**
> "CyborgDB solves Tier 1 (encryption-at-rest). But cross-hospital queries need Tier 2 (privacy-safe aggregation) to prevent revealing which hospital has cases. Charlcye from CyborgDB explicitly suggested this approach."

**Q: How does k-anonymity work?**
> "We require minimum 5 matching cases before returning results. If only 3 cases exist globally, the system blocks the query to prevent re-identification. We demonstrated this in the edge case."

**Q: What's the biggest limitation?**
> "Correlation attacks with external data. If news reports 'Boston treats rare progeria case' and our system suggests progeria, you could infer the hospital. We acknowledge this in our threat model. Future work: differential privacy on hospital-level statistics."

**Q: How would you scale to 100 hospitals?**
> "Hierarchical aggregation: Query hospitals in batches. Partial results: Return data from responsive hospitals. We project 300-400ms latency for 100 hospitals, still under the 500ms healthcare requirement."

**Q: What's the most important CyborgDB improvement?**
> "Multi-tenant key management API. Enterprise healthcare networks have 50+ hospitals. Current approach requires 50 separate CyborgDB instances. An encryption_context parameter would enable single instance, multiple contexts. This is critical for enterprise adoption."

**Q: Did you actually test with real patient data?**
> "No, we used synthetic data (Synthea) for HIPAA compliance. But the symptom patterns are realistic, and the diagnostic accuracy (87% top-1) validates the approach. Real deployment would use actual de-identified patient data."

**Q: How long did this take to build?**
> "3 weeks total. Week 1: Data pipeline and core system. Week 2: Benchmarking and stress testing. Week 3: Documentation and problem analysis. The documentation took as long as the code—intentionally, because feedback is 20% of the score."

---

## ✅ Pre-Demo Checklist

### 30 Minutes Before
- [ ] Start all services (`./setup.sh`)
- [ ] Verify backend health (http://localhost:8001/api/health)
- [ ] Verify frontend loads (http://localhost:5173)
- [ ] Test login works
- [ ] Test both queries work
- [ ] Close unnecessary applications
- [ ] Silence notifications
- [ ] Charge laptop
- [ ] Test microphone
- [ ] Test screen recording software

### 5 Minutes Before
- [ ] Open browser to http://localhost:5173
- [ ] Have demo credentials ready
- [ ] Have architecture diagram ready
- [ ] Have TECHNICAL_JOURNEY.md open
- [ ] Have backup video ready
- [ ] Take a deep breath 😊

---

## 🎬 Recording Software Recommendations

**Free Options:**
- **OBS Studio** (Windows/Mac/Linux) - Professional, open source
- **Loom** (Web-based) - Easy, automatic upload
- **QuickTime** (Mac) - Built-in, simple

**Paid Options:**
- **ScreenFlow** (Mac) - Professional editing
- **Camtasia** (Windows/Mac) - Easy editing

**Recommended:** OBS Studio (free, professional quality)

---

## 📤 Upload Instructions

### YouTube (Recommended)
1. Export video (1080p, MP4)
2. Upload to YouTube
3. Set to "Unlisted" (not private, not public)
4. Add title: "RareNet - Privacy-Preserving Rare Disease Diagnosis Demo"
5. Add description with GitHub link
6. Copy link
7. Update README.md with link

### GitHub (Alternative)
1. Export video (compress to <100MB if needed)
2. Add to `/demo` folder
3. Commit and push
4. Link in README: `[Demo Video](demo/demo_video.mp4)`

---

**Good luck! You've got this! 🚀**
