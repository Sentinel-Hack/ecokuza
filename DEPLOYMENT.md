# Ecokuza Deployment & Development Setup

## Local Development (Recommended for Testing)

### Prerequisites
- Backend: Python 3.12+, Django 5.2+
- Frontend: Node.js 20+, npm/yarn

### 1. Start Backend (Local HTTP)

```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

Backend runs at `http://localhost:8000` (HTTP only, perfect for local dev)

### 2. Start Frontend (Local HTTP)

```bash
cd frontend
npm install  # if not done
npm run dev
```

Frontend runs at `http://localhost:5173` (HTTP)

**Both use HTTP locally → No mixed content issues → Everything works!**

### 3. Test Login/Signup
- Navigate to `http://localhost:5173/login`
- Credentials will POST to `http://localhost:8000/authentification/signin/`
- Should work seamlessly

---

## Vercel + Render Production Deployment

### Backend (Render)

1. Push code to GitHub
2. On [Render.com](https://render.com):
   - Connect your GitHub repo
   - Choose "Web Service"
   - Build command: `pip install -r requirements.txt`
   - Start command: `gunicorn ecokuza.wsgi:application`
   - Environment variables:
     ```
     DEBUG=False
     SECRET_KEY=<your-secret-key>
     ALLOWED_HOSTS=ecokuza.onrender.com,ecokuza-teal.vercel.app
     ```
   - Deploy → Get URL like `https://ecokuza.onrender.com`

3. Backend now runs on **HTTPS** (Render handles SSL automatically)

### Frontend (Vercel)

1. Push code to GitHub
2. On [Vercel.com](https://vercel.com):
   - Connect your GitHub repo
   - Framework: Vite
   - Environment variables:
     ```
     VITE_API_BASE=https://ecokuza.onrender.com
     ```
     (Replace `ecokuza.onrender.com` with your actual Render URL)
   - Deploy → Get URL like `https://ecokuza-teal.vercel.app`

3. Frontend now runs on **HTTPS** (Vercel handles SSL automatically)
4. API calls automatically route to Render backend via `VITE_API_BASE`

### How It Works

- **Frontend** on `https://ecokuza-teal.vercel.app/` + **Backend** on `https://ecokuza.onrender.com/` = ✅ No mixed content, both HTTPS
- **Local dev** on `http://localhost:5173/` + `http://localhost:8000/` = ✅ No mixed content, both HTTP
- API helper (`src/lib/api.js`) automatically detects the right protocol

---

## Troubleshooting

### Issue: `ERR_SSL_PROTOCOL_ERROR` when testing locally
**Cause**: Frontend on HTTPS, backend on HTTP (mixed content)  
**Solution**: Access frontend at `http://localhost:5173` (not HTTPS)

### Issue: Login fails on Vercel with `ERR_SSL_PROTOCOL_ERROR`
**Cause**: `VITE_API_BASE` not set or pointing to wrong URL  
**Solution**: 
1. Go to Vercel project → Settings → Environment Variables
2. Add: `VITE_API_BASE=https://ecokuza.onrender.com` (use your actual Render URL)
3. Redeploy frontend

### Issue: CORS error on Vercel
**Solution**: Backend `CORS_ALLOWED_ORIGINS` in `settings.py` must include frontend URL:
```python
CORS_ALLOWED_ORIGINS = [
    "https://ecokuza-teal.vercel.app",
    "http://localhost:5173",
    "https://ecokuza.onrender.com",
]
```

---

## Environment Variables Summary

### Backend (`backend/.env` or Render env vars)
```
DEBUG=False                           # Production
SECRET_KEY=your-secret-key           # Change this!
ALLOWED_HOSTS=ecokuza.onrender.com,ecokuza-teal.vercel.app
DB_ENGINE=django.db.backends.sqlite3 # or PostgreSQL for production
```

### Frontend (`.env.local` or Vercel env vars)
```
VITE_API_BASE=https://ecokuza.onrender.com
```

---

## Quick Deployment Checklist

- [ ] Backend pushed to GitHub
- [ ] Render connected, environment variables set, deployed
- [ ] Frontend pushed to GitHub
- [ ] Vercel connected, `VITE_API_BASE` set to Render URL, deployed
- [ ] Backend `CORS_ALLOWED_ORIGINS` includes Vercel frontend URL
- [ ] Test login/signup on Vercel URL
- [ ] Monitor Network tab in browser DevTools for API calls

---

## Testing Endpoints

**Local**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/admin/` or `http://localhost:8000/authentification/signin/`

**Production**
- Frontend: `https://ecokuza-teal.vercel.app`
- Backend API: `https://ecokuza.onrender.com/admin/` or `https://ecokuza.onrender.com/authentification/signin/`
