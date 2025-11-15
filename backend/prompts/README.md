# Medical Analysis Prompts

This directory contains reusable prompt templates for medical document analysis using Google Gemini AI.

## Available Prompts

### 1. **comprehensive-analysis.txt**
Full medical document analysis with structured extraction of all key information.

### 2. **medication-extraction.txt**
Extract all medications, dosages, and instructions from medical documents.

### 3. **diagnosis-extraction.txt**
Extract diagnoses, conditions, and health issues with severity levels.

### 4. **lab-report-analysis.txt**
Analyze laboratory test results and flag abnormal values.

### 5. **medical-summary.txt**
Generate concise summaries of medical documents.

### 6. **patient-chat.txt**
System instruction for medical Q&A chatbot conversations.

## Usage

### Node.js
```javascript
const fs = require('fs');
const GeminiService = require('./gemini-service');

const gemini = new GeminiService();
const promptTemplate = fs.readFileSync('./prompts/medication-extraction.txt', 'utf-8');
const prompt = promptTemplate.replace('{{OCR_TEXT}}', ocrText);

const response = await gemini.generateText(prompt);
```

### Python
```python
from gemini_service import GeminiService

service = GeminiService()
with open('prompts/medication-extraction.txt', 'r') as f:
    prompt_template = f.read()
    
prompt = prompt_template.replace('{{OCR_TEXT}}', ocr_text)
response = service.generate_text(prompt)
```

## Template Variables

Use these placeholders in your prompts:
- `{{OCR_TEXT}}` - Extracted text from medical document
- `{{PATIENT_NAME}}` - Patient name
- `{{DOCUMENT_TYPE}}` - Type of medical document
- `{{ANALYSIS_FOCUS}}` - Specific focus area for analysis

## Best Practices

1. **Temperature**: Use 0.2-0.4 for structured extraction, 0.6-0.9 for summaries
2. **Token Limits**: Set maxTokens based on expected output size
3. **JSON Outputs**: Request JSON format in prompt for structured data
4. **Error Handling**: Always include fallback parsing for non-JSON responses
5. **Privacy**: Never log PHI (Protected Health Information) in production
