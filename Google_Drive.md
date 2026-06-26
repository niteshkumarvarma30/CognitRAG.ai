# Google Drive Picker Integration

This document outlines how the **Google Drive Picker API** was integrated into CognitRAG to allow users to securely import their cloud documents into the Knowledge Vault.

Unlike the Notion integration, which relies on a background server-to-server sync, the Google Drive integration acts as an interactive "Drag and Drop" cloud file selector directly on the frontend.

## 1. Google Cloud Configuration

To make this possible, the application was configured within the **Google Cloud Console**:
- **APIs Enabled**: Both the `Google Drive API` and `Google Picker API` were enabled.
- **OAuth Consent Screen**: Set to "External" and published to "Production", allowing any Gmail user to authenticate.
- **Credentials Generated**:
  1. **OAuth Client ID**: Used to authenticate the user and generate temporary access tokens.
  2. **API Key**: Used to initialize the Google Picker visual window.

## 2. Frontend Implementation (React)

The frontend utilizes the `react-google-drive-picker` npm package to manage the complex Google API script injections and OAuth flows.

**Location**: `frontend/app/app/(dashboard)/integrations/page.js`

1. **Script Injection**: 
   The Next.js `layout.js` file globally injects `https://apis.google.com/js/api.js` and `https://accounts.google.com/gsi/client` to prevent `ReferenceError: google is not defined` crashes.
2. **Hook Initialization**:
   The `useDrivePicker` hook is triggered when the user clicks **Select Files**. It opens a secure Google iframe.
3. **Payload Construction**:
   Once the user selects their files, the hook intercepts the `data.docs` array. The frontend iterates through the array and sends a specific payload to the backend for each file:
   ```json
   {
     "file_id": "1A2B3C...",
     "file_name": "Project Proposal.pdf",
     "mime_type": "application/pdf",
     "access_token": "ya29.a0AfB...",
     "tenant_id": "user_2pkXY..."
   }
   ```

## 3. Backend Ingestion Pipeline

The backend securely downloads the file from Google's servers without forcing the user to route the massive file directly through their browser.

**Location**: `src/api/routes.py -> POST /api/v1/ingest/google-drive`

1. **Token Authorization**: 
   The backend attaches the temporary `access_token` it received from the frontend to an HTTP `Authorization: Bearer` header.
2. **Dynamic Download**:
   - If the file is a **Google Doc** (`google-apps.document`), it calls the `/export?mimeType=text/plain` endpoint to convert the proprietary Google format into raw text.
   - If the file is standard media (e.g., a PDF), it calls the `?alt=media` endpoint to download the raw bytes.
3. **Database Insertion**:
   The file is instantly registered in the Supabase `documents` table, bypassing the standard manual file upload checks.
4. **Pipeline Execution**:
   The downloaded bytes are piped directly into `background_ingestion_pipeline`, where they are chunked, embedded via Jina AI, graphed via Gemini, and saved to Supabase and Neo4j just like any other document!

## Note on Security & Error Handling

Initially, a strict Windows Defender Application Control policy blocked the backend's `grpcio` library (used by `google-generativeai`) from loading its DLLs. This was bypassed by explicitly downgrading `grpcio` to an older, fully trusted signature (`1.62.2`), ensuring the server runs smoothly on locked-down host machines.
