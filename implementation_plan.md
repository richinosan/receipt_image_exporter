# Receipt Image Exporter Implementation Plan

## Goal
Create a premium, mobile-first web application to upload receipt images, analyze them using Gemini Flash API, and save them with a formatted filename.

## User Review Required
> [!IMPORTANT]
> - **Gemini API Key**: The app will use a default server-side key (`GEMINI_API_KEY`) if available. Users can override this in the UI, which will be stored in `localStorage` and passed to the server with each request.
> - **Styling**: Will use a "premium" dark aesthetic with smooth animations as requested.
> - **Tailwind v4**: Using the installed `@tailwindcss/vite` plugin.

## Proposed Changes

### Dependencies
パッケージ管理は、@antfu/ni コマンドを使用する。
- Install `@google/generative-ai`

### Layouts & Pages
#### [MODIFY] [Layout.astro](file:///wsl.localhost/Ubuntu/home/kanade/git/receipt_image_exporter/src/layouts/Layout.astro)
- Add meta tags for mobile optimization (viewport).
- Set up global styles (dark mode background, font).

#### [MODIFY] [index.astro](file:///wsl.localhost/Ubuntu/home/kanade/git/receipt_image_exporter/src/pages/index.astro)
- Clean up default Astro boilerplate.
- Mount the `ReceiptProcessor` Vue component.

### Components (Vue)
#### [NEW] [ReceiptProcessor.vue](file:///wsl.localhost/Ubuntu/home/kanade/git/receipt_image_exporter/src/components/ReceiptProcessor.vue)
- Main container.
- Manages state: text input for API Key, list of files, upload logic.
- Handles "Save" logic (renaming and downloading).
- Uses `auto-animate` or Vue transitions for list items.

#### [NEW] [ReceiptItem.vue](file:///wsl.localhost/Ubuntu/home/kanade/git/receipt_image_exporter/src/components/ReceiptItem.vue)
- Display individual image thumbnail.
- Editable fields for Date, Name, Currency, Amount.
- Status badge (Pending, Loading, Success, Error).
- Computed filename preview.

### API Routes
#### [NEW] [analyze.ts](file:///wsl.localhost/Ubuntu/home/kanade/git/receipt_image_exporter/src/pages/api/analyze.ts)
- POST endpoint.
- Receives image and optional API key.
- Calls Gemini Flash model.
- Returns structured JSON.

## Verification Plan
### Automated Tests
- None planned (visual UI task).

### Manual Verification
1.  **Mobile View**: Use browser dev tools to simulate iPhone 17 Pro (approx 430px width).
2.  **API Key**: Test with and without a custom key (if env var is set).
3.  **Upload**: Drag & drop multiple images.
4.  **Analysis**: Verify Gemini extracts correct info.
5.  **Filename**: Verify the generated filename matches `Date-ItemName-Currency-Amount.jpg/png`.
6.  **Save**: Click save and check downloaded filename.
