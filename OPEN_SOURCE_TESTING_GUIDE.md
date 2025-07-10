# 🔬 Open-Source Vision Model Testing Guide

This guide shows you how to test **LLaVA-1.5**, **Qwen 2.5 VL**, **Llama 3.2 Vision**, and other open-source models against our engineered bugs.

## 🚀 Quick Start Options

### Option 1: HuggingFace Inference API (Easiest)
```bash
# 1. Get HuggingFace token
# Visit: https://huggingface.co/settings/tokens

# 2. Add to .env file
echo "HUGGINGFACE_TOKEN=your_token_here" >> .env

# 3. Run test
npm run test-open-source
```

### Option 2: Local Ollama (Most Private)
```bash
# 1. Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# 2. Download LLaVA model
ollama pull llava:latest

# 3. Start Ollama
ollama serve

# 4. Run test
npm run test-open-source
```

### Option 3: Google Colab (Free GPU)
```python
# Use our provided Colab notebook
# 1. Open: https://colab.research.google.com/drive/your_notebook_link
# 2. Upload screenshots to Colab
# 3. Run vision model inference
# 4. Copy results back to our framework
```

## 📋 Detailed Setup Instructions

### 🤗 HuggingFace Inference API Testing

**Models Available:**
- `llava-hf/llava-1.5-7b-hf` (LLaVA-1.5)
- `Qwen/Qwen2-VL-7B-Instruct` (Qwen 2.5 VL)
- `meta-llama/Llama-3.2-11B-Vision-Instruct` (Llama 3.2)*

*Requires access approval

**Setup:**
```bash
# 1. Create HuggingFace account
# Visit: https://huggingface.co/join

# 2. Generate access token
# Go to: https://huggingface.co/settings/tokens
# Create token with "read" access

# 3. Add to environment
echo "HUGGINGFACE_TOKEN=hf_your_token_here" >> .env

# 4. Test connection
curl -H "Authorization: Bearer $HUGGINGFACE_TOKEN" \
     https://api-inference.huggingface.co/models/llava-hf/llava-1.5-7b-hf
```

**Costs:**
- Free tier: 1,000 requests/month
- Pro: $9/month for more requests
- Enterprise: Custom pricing

### 🏠 Local Ollama Testing

**Models Available:**
- `llava:latest` (LLaVA 1.5)
- `llava:13b` (Larger LLaVA)
- `bakllava:latest` (Enhanced LLaVA)

**Setup:**
```bash
# 1. Install Ollama
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from: https://ollama.ai/download

# 2. Start Ollama service
ollama serve

# 3. Download vision models
ollama pull llava:latest
ollama pull bakllava:latest

# 4. Test locally
ollama run llava:latest "What's in this image?" --image screenshot.png

# 5. Verify API access
curl http://localhost:11434/api/version
```

**Requirements:**
- 8GB+ RAM recommended
- GPU optional but improves speed
- ~4GB storage per model

### ☁️ Cloud GPU Testing

**Google Colab (Free):**
```python
# 1. Create Colab notebook
# 2. Install dependencies
!pip install transformers torch torchvision pillow

# 3. Load model
from transformers import LlavaNextProcessor, LlavaNextForConditionalGeneration
import torch
from PIL import Image

model = LlavaNextForConditionalGeneration.from_pretrained(
    "llava-hf/llava-1.5-7b-hf", 
    torch_dtype=torch.float16
)
processor = LlavaNextProcessor.from_pretrained("llava-hf/llava-1.5-7b-hf")

# 4. Process images
image1 = Image.open("baseline.png")
image2 = Image.open("broken.png")

prompt = "Compare these screenshots and list all visual differences"
inputs = processor(prompt, [image1, image2], return_tensors="pt")

# 5. Generate response
output = model.generate(**inputs, max_new_tokens=500)
response = processor.decode(output[0], skip_special_tokens=True)
print(response)
```

**RunPod/Vast.ai (Paid GPU):**
```bash
# 1. Create account at runpod.io or vast.ai
# 2. Launch PyTorch template
# 3. Install our testing framework
# 4. Run models with GPU acceleration
```

### 🔧 Local Transformers Setup

**Requirements:**
- Python 3.8+
- 8GB+ GPU VRAM (recommended)
- 50GB+ storage for models

**Setup:**
```bash
# 1. Create Python environment
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# 2. Install dependencies
pip install transformers torch torchvision pillow requests

# 3. Install model-specific packages
pip install accelerate bitsandbytes  # For quantization
pip install flash-attn  # For faster attention (optional)

# 4. Create test script
cat > test_local_models.py << EOF
import torch
from transformers import AutoProcessor, AutoModelForVision2Seq
from PIL import Image
import base64
import io

# Load model
model_id = "llava-hf/llava-1.5-7b-hf"
model = AutoModelForVision2Seq.from_pretrained(
    model_id, 
    torch_dtype=torch.float16,
    device_map="auto"
)
processor = AutoProcessor.from_pretrained(model_id)

# Load images
def load_image_from_base64(base64_str):
    image_data = base64.b64decode(base64_str)
    return Image.open(io.BytesIO(image_data))

# Test function
def analyze_images(baseline_b64, broken_b64):
    baseline_img = load_image_from_base64(baseline_b64)
    broken_img = load_image_from_base64(broken_b64)
    
    prompt = "Compare these two website screenshots and list all visual differences you can find."
    
    inputs = processor(
        text=prompt,
        images=[baseline_img, broken_img],
        return_tensors="pt"
    ).to(model.device)
    
    with torch.no_grad():
        output = model.generate(**inputs, max_new_tokens=512)
    
    response = processor.decode(output[0], skip_special_tokens=True)
    return response

# Example usage
if __name__ == "__main__":
    # Load your base64 screenshots here
    result = analyze_images(baseline_base64, broken_base64)
    print(result)
EOF
```

## 🧪 Running the Tests

### Update package.json
```json
{
  "scripts": {
    "test-open-source": "node scripts/test-open-source-models.cjs",
    "test-ollama": "node scripts/test-open-source-models.cjs --ollama-only",
    "test-huggingface": "node scripts/test-open-source-models.cjs --hf-only",
    "compare-all-models": "npm run ai:demo && npm run test-open-source"
  }
}
```

### Run Comprehensive Test
```bash
# Test all available models
npm run test-open-source

# Test specific deployment
npm run test-ollama
npm run test-huggingface

# Full comparison including commercial models
npm run compare-all-models
```

## 📊 Expected Results

### Accuracy Predictions
```
Model               Expected Accuracy    Cost          Deployment
─────────────────   ─────────────────   ────────────  ──────────────
OpenAI GPT-4o       33% (actual)        $0.01-0.03    API only
Gemini 1.5 Flash    15% (actual)        $0.01-0.02    API only
LLaVA-1.5           25-35%*             Free-$0.01    Local/Cloud
Qwen 2.5 VL         35-45%*             Free-$0.02    Local/Cloud  
Llama 3.2 Vision    30-40%*             Free          Local/Cloud
*Projected based on capabilities
```

### Performance Metrics
- **Speed**: Local Ollama > HF Inference > Local Transformers
- **Quality**: Qwen 2.5 VL > Llama 3.2 > LLaVA-1.5 (projected)
- **Cost**: Local > Free APIs > Paid APIs
- **Privacy**: Local > Cloud APIs

## 🎯 Breakthrough Scenarios

**If Qwen 2.5 VL achieves 45% accuracy:**
- 3x better than Gemini (15%)
- 35% better than OpenAI (33%)
- Proves open-source can beat commercial models

**If any model reaches 60%+ with fine-tuning:**
- Game-changing for the industry
- Democratizes advanced visual testing
- Challenges traditional tool pricing

## 🚀 Next Steps

1. **Start with easiest option**: HuggingFace Inference API
2. **Set up local testing**: Install Ollama for privacy
3. **Compare results**: Run against our ground truth bugs
4. **Fine-tune best performer**: Train on UI-specific data
5. **Create hybrid approach**: Combine multiple models

## 💡 Tips for Success

- Start with smaller models (7B) before trying larger ones
- Use GPU when possible for faster inference
- Test one browser at a time initially
- Save intermediate results to avoid re-running
- Compare output formats across different models
- Consider ensemble approaches combining multiple models

---

**This testing framework will create the world's first comprehensive open-source vs commercial AI vision model comparison for UI testing!** 🎉 