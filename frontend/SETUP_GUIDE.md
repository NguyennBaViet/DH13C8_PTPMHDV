# Frontend Setup Guide - Khách Sạn Online

## 📋 Project Overview

**Khách Sạn Online Frontend** - A premium hotel booking interface built with modern web technologies.

- **Framework**: React 18
- **Build Tool**: Vite (ultra-fast)
- **Styling**: TailwindCSS (utility-first)
- **State Management**: React Context + Hooks
- **HTTP Client**: Axios
- **Routing**: React Router v6

---

## 🚀 Installation & Setup

### Step 1: Prerequisites
```bash
# Ensure you have Node.js 16+ installed
node --version
npm --version
```

### Step 2: Install Dependencies
```bash
cd frontend
npm install
```

### Step 3: Configure Environment Variables

Create `.env` file in frontend root:
```env
# Backend API URL
VITE_API_URL=http://localhost:8020
```

### Step 4: Start Development Server
```bash
npm run dev
```

Frontend will be available at: **http://localhost:5173**

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Header.jsx        # Navigation header
│   │   ├── Footer.jsx        # Footer
│   │   ├── HotelCard.jsx     # Hotel display card
│   │   ├── RoomCard.jsx      # Room selection card
│   │   ├── BookingSummary.jsx # Booking details
│   │   ├── PaymentForm.jsx   # Payment form
│   │   └── ...
│   │
│   ├── pages/                # Full page components
│   │   ├── Home.jsx          # Landing page
│   │   ├── Login.jsx         # Login page
│   │   ├── Register.jsx      # Registration page
│   │   ├── HotelSearch.jsx   # Hotel search/listing
│   │   ├── HotelDetail.jsx   # Hotel details
│   │   ├── Booking.jsx       # Booking form
│   │   ├── Payment.jsx       # Payment page
│   │   ├── MyBookings.jsx    # User bookings
│   │   ├── UserProfile.jsx   # User profile
│   │   └── ...
│   │
│   ├── services/             # API calls & business logic
│   │   ├── api.js            # Axios setup + interceptors
│   │   ├── authService.js    # Auth API calls
│   │   ├── hotelService.js   # Hotel API calls
│   │   ├── bookingService.js # Booking API calls
│   │   └── paymentService.js # Payment API calls
│   │
│   ├── context/              # React Context for state
│   │   ├── AuthContext.jsx   # Auth state management
│   │   └── BookingContext.jsx # Booking state
│   │
│   ├── hooks/                # Custom hooks
│   │   ├── useAuth.js        # Auth hook
│   │   └── useApi.js         # API call hook
│   │
│   ├── App.jsx               # Main app component
│   ├── index.css             # Global styles
│   └── main.jsx              # Entry point
│
├── public/                   # Static assets
│   └── images/              # Hotel/room images
│
├── package.json             # Dependencies
├── vite.config.js           # Vite config
├── tailwind.config.js       # Tailwind config
├── postcss.config.js        # PostCSS config
├── index.html               # HTML template
└── .env                     # Environment variables
```

---

## 🎨 Design System

### Color Palette (Luxury Hotel Theme)

| Color | Value | Usage |
|-------|-------|-------|
| Primary Dark | #1f2937 | Main background, text |
| Primary Medium | #6b7280 | Secondary text |
| Primary Light | #f9fafb | Light background |
| Luxury Gold | #d4af37 | Accents, buttons |
| Accent Sky | #0ea5e9 | Links, highlights |
| Success | #10b981 | Confirmations |
| Warning | #f59e0b | Warnings |
| Error | #ef4444 | Errors |

### Typography

| Type | Font | Size | Weight |
|------|------|------|--------|
| H1 (Title) | Poppins | 36px | Bold |
| H2 (Section) | Poppins | 28px | Bold |
| H3 (Subsection) | Poppins | 24px | Bold |
| Body | Inter | 16px | Regular |
| Button | Inter | 14px | Semibold |

### Components

All components use TailwindCSS utilities defined in `src/index.css`:

- `.btn-primary` - Primary action button
- `.btn-secondary` - Secondary (gold) button
- `.btn-outline` - Outline button
- `.card` - Standard card
- `.card-luxury` - Premium card with gold accent
- `.form-input` - Form input field
- `.form-label` - Form label

---

## 📱 Key Pages & Features

### 1. **Home Page** (`pages/Home.jsx`)
- Hero section with search bar
- Featured hotels carousel
- Customer testimonials
- CTA buttons

### 2. **Authentication**
- **Login** (`pages/Login.jsx`)
  - Form validation
  - Error messages
  - "Remember me" option
  
- **Register** (`pages/Register.jsx`)
  - Multi-field form
  - Password strength indicator
  - Terms & conditions

### 3. **Hotel Search** (`pages/HotelSearch.jsx`)
- Advanced filters:
  - Location
  - Price range
  - Star rating
  - Amenities
  - Check-in/out dates
- Grid display of results
- Pagination

### 4. **Hotel Detail** (`pages/HotelDetail.jsx`)
- Image gallery (carousel)
- Full description
- Amenities list
- Available rooms
- Map view
- Guest reviews

### 5. **Booking** (`pages/Booking.jsx`)
- Room selection
- Date picker
- Guest information
- Special requests
- Price summary
- Confirmation

### 6. **Payment** (`pages/Payment.jsx`)
- Payment method selection
- Form validation
- Amount display
- Success/failure handling

### 7. **My Bookings** (`pages/MyBookings.jsx`)
- List all user bookings
- Status tracking
- Booking details
- Cancel option

### 8. **User Profile** (`pages/UserProfile.jsx`)
- Personal information
- Avatar upload
- Change password
- Booking history
- Reviews

---

## 🔧 Development

### Adding a New Page

1. Create file in `src/pages/MyPage.jsx`
2. Add route in `App.jsx`:
```jsx
<Route path="/my-page" element={<MyPage />} />
```
3. Add navigation link in `Header.jsx`

### Adding a New Component

1. Create file in `src/components/MyComponent.jsx`
2. Export as default
3. Import and use in pages

### API Integration

Example API call:
```jsx
import api from '../services/api'

// In component
const [hotels, setHotels] = useState([])

useEffect(() => {
  api.get('/api/hotels')
    .then(data => setHotels(data.data))
    .catch(err => console.error('Error:', err))
}, [])
```

---

## 🧪 Testing

### Unit Tests (Future)
```bash
npm run test
```

### Build for Production
```bash
npm run build
```

Output: `dist/` folder

### Preview Production Build
```bash
npm run preview
```

---

## 📊 Performance Optimization

- **Code Splitting**: Lazy load pages with React.lazy()
- **Image Optimization**: Use modern formats (WebP)
- **Caching**: Leverage browser cache
- **Minification**: Automatic with Vite build
- **CSS Purging**: TailwindCSS removes unused styles

---

## 🔒 Security Best Practices

1. **JWT Token Storage**:
   - Store in localStorage (with caution)
   - Send in Authorization header
   - Auto-logout on expiration

2. **API Calls**:
   - Validate input before sending
   - Handle errors gracefully
   - Never log sensitive data

3. **XSS Prevention**:
   - React sanitizes by default
   - Use DOMPurify for user-generated content

4. **CORS**:
   - Backend handles CORS headers
   - Frontend respects same-origin policy

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module"
**Solution**: Ensure all imports have correct paths
```jsx
// Correct
import Header from '../components/Header'

// Wrong
import Header from '/components/Header'
```

### Issue: Environment variables not loading
**Solution**: 
1. Create `.env` file in frontend root
2. Prefix with `VITE_`
3. Restart dev server
4. Access with `import.meta.env.VITE_*`

### Issue: API calls return 401
**Solution**: 
1. Check token stored in localStorage
2. Verify token not expired
3. Check `Authorization` header being sent
4. Ensure backend JWT_SECRET matches

### Issue: Styles not applying
**Solution**:
1. Verify Tailwind config includes all files
2. Check class names are correct
3. Ensure no CSS conflicts
4. Clear browser cache (Ctrl+Shift+Delete)

---

## 🚀 Deployment

### Build
```bash
npm run build
```

### Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Drag dist/ folder to Netlify
```

### Deploy to GitHub Pages
```bash
npm run build
# Push dist/ to gh-pages branch
```

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [TailwindCSS Docs](https://tailwindcss.com)
- [Axios Documentation](https://axios-http.com)
- [React Router Docs](https://reactrouter.com)

---

## 💡 Next Steps

1. ✅ Install dependencies
2. ✅ Configure `.env`
3. ✅ Start dev server
4. ✅ Create pages and components
5. ✅ Integrate API services
6. ✅ Add styling with Tailwind
7. ✅ Test all features
8. ✅ Build for production

---

## 📞 Support

For issues:
1. Check console for errors (F12)
2. Verify backend services running
3. Check `.env` configuration
4. Review component props
5. Test API endpoints with Postman

---

**Status**: Ready for development  
**Last Updated**: Oct 2024
