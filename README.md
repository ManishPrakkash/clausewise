# ClauseWise - Document Analysis Platform

A modern React application for analyzing land documents and contracts using OCR, AI-powered insights, and interactive chatbots.

## Features

- **Document Upload & OCR**: Upload images and extract text using Tesseract.js
- **AI-Powered Analysis**: Generate summaries and key points from documents
- **Interactive Chatbot**: Ask questions about your documents using Hugging Face AI
- **Random Contract Alerts**: Dynamic alert generation for different document types
- **Modern UI**: Glassmorphism design with dark/light mode support
- **PDF Export**: Download analysis reports as PDFs

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Hugging Face API (Optional)**
   
   For enhanced chatbot functionality, create a `.env` file in the root directory:
   ```
   VITE_HUGGINGFACE_API_KEY=hf_your_api_key_here
   ```
   
   Get your API key from: https://huggingface.co/settings/tokens
   
   Note: The chatbot works with fallback responses even without the API key.

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## Usage

1. **Upload Documents**: Drag and drop image files (JPG, PNG, etc.)
2. **View Analysis**: See extracted text, summaries, and key points
3. **Check Alerts**: Review randomly generated contract alerts
4. **Ask Questions**: Use the chatbot to get insights about your documents
5. **Export Reports**: Download analysis as PDF

## Document Types Supported

- Land Ownership Contracts
- Patta Documents
- Chitta Documents
- Title Deeds
- A-Register Documents
- FMB Documents

## Technology Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS
- **OCR**: Tesseract.js
- **AI**: Hugging Face Inference API
- **PDF**: jsPDF
- **Icons**: React Icons

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navigation.jsx
│   ├── ProtectedRoute.jsx
│   └── DocumentChatbot.jsx
├── pages/              # Page components
│   ├── Dashboard.jsx
│   ├── UploadContract.jsx
│   ├── AnalysisSummary.jsx
│   └── ...
├── utils/              # Utility functions
│   ├── documentExtractor.js
│   ├── contractAlerts.js
│   ├── huggingFaceService.js
│   └── ...
└── assets/             # Static assets
```
