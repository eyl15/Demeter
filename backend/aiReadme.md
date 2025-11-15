# Google Gemini AI Setup - Quick Start

## ✅ What's Configured

Your backend now has Google Gemini AI integrated with:
- **Structured JSON responses** with `Ingredients` array schema
- **Image analysis** for fridge photos using `scanner.txt` prompt
- **Type-safe schema** using `Type.OBJECT` and `Type.ARRAY`
- **Model**: `gemini-2.5-pro`

---

## 📦 Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install @google/genai
npm install @google/genai mime
npm install -D @types/node
```


### 2. Start Server

```bash
node server.js
```

---

## 🎯 Main Endpoint

### Analyze Fridge Image

```bash
POST http://localhost:8080/api/analyze-fridge
Content-Type: application/json

{
  "uid": "user123"
}
```

**Response:**
```json
{
  "response": {
    "Ingredients": [
      "Milk",
      "Eggs",
      "Lettuce",
      "Tomatoes",
      "Cheese",
      "Orange juice"
    ]
  },
  "imageUrl": "https://storage.googleapis.com/...",
  "imageName": "user123/images/fridge/1234567890-fridge.jpg"
}
```

---

## 🔧 How It Works

1. **User uploads fridge photo:**
   ```bash
   POST /upload
   file: fridge.jpg
   uid: user123
   folder: images/fridge
   ```

2. **Backend saves to:** `{uid}/images/fridge/{timestamp}-{filename}`

3. **User requests analysis:**
   ```bash
   POST /api/analyze-fridge
   { "uid": "user123" }
   ```

4. **Backend:**
   - Finds latest image in `{uid}/images/fridge/`
   - Downloads from Firebase Storage
   - Sends to Gemini with structured schema
   - Returns JSON with `Ingredients` array

---

## 📝 Schema Configuration

The response schema is defined as:

```javascript
responseSchema: {
  type: Type.OBJECT,
  required: ["Ingredients"],
  properties: {
    Ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },
  },
}
```

This ensures Gemini **always** returns:
```json
{
  "Ingredients": ["item1", "item2", "item3"]
}
```

---

## 🛠️ Configuration

Current settings in `aiService.js`:

```javascript
{
  temperature: 0.2,           // Low for accurate detection
  thinkingBudget: -1,         // Unlimited thinking
  imageSize: '1K',            // 1K resolution
  responseMimeType: 'application/json',
  responseSchema: { ... }     // Structured Ingredients array
}
```

---

## 🎨 Frontend Example

```javascript
async function analyzeFridge(uid) {
  const response = await fetch('http://localhost:8080/api/analyze-fridge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid }),
  });
  
  const data = await response.json();
  console.log('Ingredients:', data.response.Ingredients);
  // ["Milk", "Eggs", "Lettuce", ...]
}
```

---

## 📋 Next Steps

1. ✅ Run: `npm install @google/genai mime`
2. ✅ Add `GEMINI_API_KEY` to `.env`
3. ✅ Test: `POST /api/analyze-fridge` with a user ID
4. ✅ Integrate with your frontend

---

## 💡 Tips

- Edit `prompts/scanner.txt` to customize what AI looks for
- Response is **always** JSON with `Ingredients` array
- Use low temperature (0.2) for consistent results
- Model automatically parses and structures the response

---

Happy coding! 🚀
