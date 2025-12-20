# Quick Reference - Disaster Rescue Application

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# → Opens at http://localhost:5173/

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 📂 Project Structure

```
DisasterRescue/
├── src/
│   ├── components/          # React components (27 files)
│   │   ├── MapDashboard.tsx
│   │   ├── DisasterMap.tsx
│   │   ├── ReliefDashboard.tsx
│   │   ├── LiveNews.tsx
│   │   ├── SafetyGuidelines.tsx
│   │   └── ...
│   ├── services/            # API services
│   │   ├── disaster-data-service.ts  # NDMA SACHET integration
│   │   ├── relief-service.ts
│   │   ├── shelter-service.ts
│   │   └── route-service.ts
│   ├── utils/               # Helper functions
│   │   ├── smart-detection.ts        # AI disaster classification
│   │   └── disaster-utils.ts
│   ├── config/              # Configuration
│   │   └── disaster-config.ts        # Disaster types, icons, colors
│   ├── types/               # TypeScript types
│   ├── hooks/               # Custom React hooks
│   ├── contexts/            # React contexts (Auth)
│   └── assets/              # Images and static files
├── dist/                    # Production build output
└── docs/                    # Documentation
```

## 🎯 Key Features

### 1. Map Dashboard
- Real-time disaster tracking
- Interactive Leaflet map
- Smart marker clustering
- Disaster details panel
- Live statistics
- Layer controls (Street/Satellite)
- Live Cyclone View (Windy.com)

### 2. Relief Network
- **Victim Mode:** Request assistance (Food, Medical, Rescue, Shelter, Financial)
- **Volunteer Mode:** View and respond to requests
- Relief map with request locations
- Financial aid with UPI validation
- Admin verification system

### 3. Safety Guidelines
- Comprehensive guides for:
  - Earthquakes
  - Floods
  - Cyclones
  - Fires
- Before/During/After instructions
- Emergency contact numbers

### 4. Live News Feed
- Real-time alerts from NDMA SACHET
- Search by location/keyword
- Filter by disaster type
- Disaster-specific images
- "View on Map" functionality

## 🔌 API Integration

### NDMA SACHET (Primary Data Source)
```typescript
// Endpoint
https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml

// Proxy (configured in vite.config.ts)
/api/sachet → NDMA SACHET RSS feed

// Features
- Real-time disaster alerts
- CAP (Common Alerting Protocol) format
- Covers all of India
- Updated continuously
```

### Data Processing
```typescript
// Location extraction: 150+ Indian cities
// Disaster type detection: Smart keyword analysis
// Severity classification: Critical, High, Medium, Low
// Coordinate validation: Filters invalid data
```

## 🎨 Design System

### Colors
```css
/* Disaster Types */
--flood: #2196F3 (Blue)
--fire: #FF5722 (Red-Orange)
--cyclone: #00BCD4 (Cyan)
--earthquake: #795548 (Brown)
--drought: #FFC107 (Amber)
--landslide: #8D6E63 (Brown-Grey)
--thunderstorm: #607D8B (Blue-Grey)
--heatwave: #FF9800 (Orange)
--coldwave: #76A3D8 (Light Blue)

/* Severity */
--critical: #9C27B0 (Purple)
--high: #F44336 (Red)
--medium: #FF9800 (Orange)
--low: #4CAF50 (Green)
```

### Icons (Material Symbols)
- Flood: `flood`
- Fire: `local_fire_department`
- Cyclone: `cyclone`
- Earthquake: `broken_image`
- Drought: `water_loss`
- Landslide: `landslide`
- Thunderstorm: `thunderstorm`
- Heatwave: `thermostat`
- Coldwave: `ac_unit`

## 🛠️ Common Tasks

### Adding a New Disaster Type
1. Add to `src/types/index.ts`:
   ```typescript
   export type DisasterType = 'flood' | 'earthquake' | ... | 'newtype'
   ```

2. Add configuration in `src/config/disaster-config.ts`:
   ```typescript
   newtype: {
     label: 'New Type',
     iconName: 'icon_name',
     color: '#HEXCODE',
     image: newTypeImg,
     keywords: { 'keyword': 0.9, ... }
   }
   ```

3. Add image to `src/assets/disaster/newtype.png`

### Modifying Smart Detection
Edit `src/utils/smart-detection.ts`:
```typescript
export function getSmartDisasterDetails(disaster: Disaster) {
  // Modify keyword matching logic
  // Adjust confidence thresholds
  // Update classification rules
}
```

### Customizing Map Appearance
Edit `src/components/DisasterMap.tsx`:
```typescript
// Change default center
const defaultCenter: [number, number] = [20.5937, 78.9629]

// Change default zoom
const defaultZoom = 5

// Modify marker icons
const getDisasterIcon = (disaster) => { ... }
```

## 🔍 Debugging Tips

### Check Console Logs
```javascript
// Enable verbose logging
console.log('Disaster data:', disasters)
console.log('Enriched disasters:', enrichedDisasters)
```

### Validate Coordinates
```typescript
// Check for invalid coordinates
if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
  console.warn('Invalid coordinates:', { lat, lng })
}
```

### Test API Connection
```bash
# Test NDMA SACHET directly
curl https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml
```

### Clear Cache
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

## 📊 Performance Optimization

### Already Implemented
- ✅ Icon caching (prevents re-creation)
- ✅ Memoization (useMemo, useCallback)
- ✅ Lazy loading (code splitting)
- ✅ Marker clustering (handles 1000+ markers)
- ✅ Coordinate validation (prevents crashes)

### Tips
```typescript
// Use React.memo for expensive components
const ExpensiveComponent = memo(({ data }) => { ... })

// Memoize expensive calculations
const result = useMemo(() => expensiveCalculation(data), [data])

// Debounce search input
const debouncedSearch = useDebounce(searchQuery, 300)
```

## 🔐 Security Best Practices

### Input Validation
```typescript
// Always validate user input
const isValidUPI = (id: string) => {
  return /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(id)
}

// Sanitize amounts
if (parseInt(amount) <= 0 || parseInt(amount) > 1000000) {
  return error('Invalid amount')
}
```

### API Security
- Use Vite proxy to avoid CORS
- Never expose API keys in client code
- Use HTTPS for all external requests
- Validate all API responses

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile */
@media (max-width: 768px) { ... }

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) { ... }

/* Desktop */
@media (min-width: 1025px) { ... }
```

## 🧪 Testing Checklist

### Before Deployment
- [ ] Run `npm run build` successfully
- [ ] Test all navigation tabs
- [ ] Verify map loads and markers display
- [ ] Test search and filtering
- [ ] Submit test relief request
- [ ] Check console for errors
- [ ] Test on different browsers
- [ ] Test on mobile devices
- [ ] Verify API data loading
- [ ] Check all images load

## 📞 Emergency Contact Numbers (India)

```
National Emergency: 112
Ambulance: 108
Fire & Rescue: 101
Disaster Management: 1078
Police: 100
Women Helpline: 1091
Child Helpline: 1098
```

## 🔗 Useful Links

- **NDMA SACHET:** https://sachet.ndma.gov.in/
- **Leaflet Docs:** https://leafletjs.com/
- **React Leaflet:** https://react-leaflet.js.org/
- **Vite Docs:** https://vitejs.dev/
- **Material Symbols:** https://fonts.google.com/icons

## 📝 Environment Variables

Create `.env` file:
```bash
# API Configuration (if needed in future)
VITE_API_KEY=your_api_key_here
VITE_API_URL=https://api.example.com

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

## 🎓 Learning Resources

### Understanding the Codebase
1. Start with `src/App.tsx` - Main application structure
2. Review `src/types/index.ts` - Data structures
3. Study `src/services/disaster-data-service.ts` - API integration
4. Explore `src/components/DisasterMap.tsx` - Map implementation
5. Check `src/utils/smart-detection.ts` - AI classification

### Key Concepts
- **Lazy Loading:** Components loaded on-demand
- **Memoization:** Cache expensive calculations
- **Clustering:** Group nearby markers for performance
- **Smart Detection:** AI-powered disaster classification
- **Coordinate Validation:** Prevent crashes from bad data

---

**Last Updated:** December 20, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅
