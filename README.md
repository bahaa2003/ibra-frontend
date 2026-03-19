<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/7e7ca50b-5d79-4ad3-96bb-4b0939c154f7

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Configure Environment Variables

   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # API Configuration
   VITE_API_BASE_URL=http://localhost:5000/api

   # Gemini API
   GEMINI_API_KEY=your_gemini_api_key_here

   # App Settings
   VITE_APP_ENV=development
   VITE_APP_MODE=development
   APP_URL=http://localhost:3000
   ```

   Or copy from `.env.example`:

   ```bash
   cp .env.example .env.local
   ```

3. Update the environment variables:
   - `VITE_API_BASE_URL`: Your API server URL (default: `http://localhost:5000/api`)
   - `GEMINI_API_KEY`: Your Gemini API key from [AI Studio](https://ai.studio)
4. Run the app:
   `npm run dev`

## Environment Configuration

- **Development (.env.development)**: Auto-loaded when running `npm run dev`
- **Local (.env.local)**: Overrides other .env files (git-ignored)
- **Example (.env.example)**: Template for configuration

## API Integration

The app uses Axios for API calls with automatic fallback to mock data if the API is not available.

- API base URL: Configured via `VITE_API_BASE_URL`
- Timeout: 5 seconds
- Mock data: Used when API fails or is not configured
