# CORS Solution for SACHET RSS Feed

## Problem
The SACHET RSS feeds are blocked by CORS (Cross-Origin Resource Sharing) policy when fetching directly from the browser. This is a security feature that prevents websites from accessing resources from other domains.

## Solutions

### Solution 1: Use CORS Proxy (Development - Already Implemented)
The code now uses a public CORS proxy (`api.allorigins.win`) for development. This works but has limitations:
- ✅ Quick to implement
- ✅ Works for development
- ❌ Not recommended for production
- ❌ May have rate limits
- ❌ Depends on third-party service

**Status:** Already enabled in the code

### Solution 2: Use S3 Direct URL (Best for Production)
The error messages revealed that the actual RSS feed is hosted on S3:
```
https://cap-sources.s3.amazonaws.com/in-imd-en/rss.xml
```

**Try these S3 URLs directly:**
- `https://cap-sources.s3.amazonaws.com/in-imd-en/rss.xml` (IMD alerts)
- `https://cap-sources.s3.amazonaws.com/in-ndma-en/rss.xml` (Possible NDMA alerts)

S3 buckets can be configured to allow CORS, so these might work directly.

**Status:** Added to the endpoint list (tried first)

### Solution 3: Backend Proxy Server (Recommended for Production)
Create a backend server that fetches the RSS feed and serves it to your frontend.

#### Option A: Node.js/Express Backend
```javascript
// server.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

app.get('/api/sachet-rss', async (req, res) => {
  try {
    const response = await fetch('https://ndma.gov.in/sachet/cap/rss');
    const xml = await response.text();
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Proxy server running on port 3000'));
```

Then update your frontend to call:
```typescript
const response = await fetch('http://localhost:3000/api/sachet-rss')
```

#### Option B: Vite Proxy (Development)
Add to `vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/sachet': {
        target: 'https://ndma.gov.in',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sachet/, '/sachet/cap/rss')
      }
    }
  }
})
```

Then fetch from: `http://localhost:5173/api/sachet`

### Solution 4: Browser Extension (Development Only)
Use a browser extension like "CORS Unblock" for development. **Not for production!**

## Current Implementation

The code now:
1. ✅ Tries S3 URLs first (may work without CORS proxy)
2. ✅ Falls back to using a public CORS proxy for other endpoints
3. ✅ Logs detailed error messages for debugging

## For Your Final Year Project

**Recommended Approach:**
1. **Development:** Use the current CORS proxy solution (already implemented)
2. **Production/Demo:** Set up a simple backend proxy server
3. **Documentation:** Explain CORS and why a proxy is needed

### Quick Backend Setup (Express.js)

1. Create `server/` directory
2. Install dependencies:
   ```bash
   npm install express cors node-fetch
   ```
3. Create `server/index.js`:
   ```javascript
   const express = require('express');
   const cors = require('cors');
   const fetch = require('node-fetch');
   
   const app = express();
   app.use(cors());
   
   app.get('/api/sachet-rss', async (req, res) => {
     try {
       const url = 'https://cap-sources.s3.amazonaws.com/in-imd-en/rss.xml';
       const response = await fetch(url);
       const xml = await response.text();
       res.set('Content-Type', 'application/xml');
       res.send(xml);
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   
   app.listen(3001, () => console.log('Proxy server on port 3001'));
   ```
4. Update frontend to use: `http://localhost:3001/api/sachet-rss`

## Testing

1. Check if S3 URLs work directly (no CORS proxy needed)
2. If not, the CORS proxy should work for development
3. For production, set up the backend proxy

## Notes

- The S3 URL (`cap-sources.s3.amazonaws.com`) is likely the actual feed location
- NDMA website may redirect to S3, which is why we see it in CORS headers
- S3 buckets can be configured to allow CORS from specific origins

