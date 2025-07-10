# 🎯 DEMO QUICK REFERENCE CARD

## 🚀 **SETUP COMMANDS** (CRITICAL - DO FIRST!)
```bash
npm run start              # ⚠️  MUST START SERVER FIRST!
echo $APPLITOOLS_API_KEY   # Verify API key  
npm run demo:setup-visual  # First-time only: capture baseline
```
**⚠️ IMPORTANT**: 
- Server MUST be running at localhost:3000 before tests!
- After baseline capture, go to dashboard and click "ACCEPT"!

## 🎭 **DEMO SEQUENCE**

### 1️⃣ **VISUAL SETUP**
```bash
open http://localhost:3000/baseline-page.html
open http://localhost:3000/broken-page.html
```
**SAY**: *"Two pages - clearly different visually"*

### 2️⃣ **TRADITIONAL TESTING**  
```bash
npm run test:static-functional
```
**SAY**: *"Traditional testing: ALL TESTS PASS!"*
**POINT OUT**: *"FALSE CONFIDENCE - 0/10 bugs detected"*

### 3️⃣ **VISUAL AI TESTING** (Two Steps!)
```bash
# Step A: Capture baseline (first time only)
npm run test:baseline-capture
# → Go to dashboard, click "ACCEPT" to approve baseline

# Step B: Test broken page against baseline  
npm run test:broken-compare
```
**SAY**: *"First we establish the gold standard, then detect differences!"*
**POINT OUT**: *"Clear visual diff - no purple confusion!"*
**DEMO TIP**: *Show dashboard approval live for maximum impact!*

### 4️⃣ **DASHBOARD** (Optional)
```bash
open https://eyes.applitools.com
```
**SAY**: *"See detailed visual comparison"*

---

## 💬 **KEY SOUND BITES**

- **"This is the FALSE CONFIDENCE problem"**
- **"Traditional: 0/10 bugs detected"**  
- **"Visual AI: 10/10 bugs detected"**
- **"20-50x faster than manual review"**
- **"Pixel-perfect vs human error-prone"**

## 📊 **POWER STATS**
- Traditional: **100% pass rate** (but 10 visual bugs)
- Visual AI: **100% accuracy** (catches every difference)
- Speed: **Seconds vs Hours**
- ROI: **5-10x within months**

## 🛠️ **EMERGENCY COMMANDS**
```bash
ps aux | grep node                    # Check servers
npm run start                         # Restart production
APPLITOOLS_SHOW_LOGS=true npm run test:static-visual  # Debug
``` 