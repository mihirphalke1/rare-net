# RareNet Troubleshooting Guide

Quick solutions for common setup and runtime issues.

---

## Setup Issues

### Issue 1: Docker Compose Fails to Start

**Symptom:** `docker-compose up` exits with connection errors

**Causes & Solutions:**

1. **Ports already in use**
   ```powershell
   # Check what's using the ports
   netstat -ano | findstr :8000
   netstat -ano | findstr :8001
   netstat -ano | findstr :5173
   
   # Solution: Stop existing services
   docker-compose down
   # Or kill the process using the port
   ```

2. **Docker not running**
   ```powershell
   # Check Docker status
   docker ps
   
   # Solution: Start Docker Desktop
   ```

3. **Redis connection fails**
   - **Old issue (FIXED):** Connection string was `host:redis,port:6379,db:0`
   - **New format:** `redis://redis:6379/0`
   - If you see connection errors, verify `docker-compose.yml` has the updated format

---

### Issue 2: Python Dependencies Fail to Install

**Symptom:** `pip install -r requirements.txt` errors

**Causes & Solutions:**

1. **Python version too old**
   ```powershell
   python --version  # Must be 3.9+
   
   # Solution: Install Python 3.9 or higher
   ```

2. **PyTorch/Sentence-Transformers timeout**
   ```powershell
   # Solution: Install with increased timeout
   pip install --timeout=120 -r requirements.txt
   
   # Or install sentence-transformers separately
   pip install sentence-transformers --no-cache-dir
   ```

3. **Conflicting package versions**
   ```powershell
   # Solution: Create fresh virtual environment
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

---

### Issue 3: Frontend Won't Start

**Symptom:** `npm run dev` fails or frontend doesn't load

**Causes & Solutions:**

1. **Node modules not installed**
   ```bash
   # Check if node_modules exists
   cd frontend
   
   # Solution: Install dependencies
   npm install
   ```

2. **Port 5173 in use**
   ```powershell
   # Solution: Use different port
   npm run dev -- --port 5174
   ```

3. **Build errors with Vite**
   ```bash
   # Solution: Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run dev
   ```

---

## Runtime Issues

### Issue 4: "CyborgDB not available" Error

**Symptom:** API returns 503 or "CyborgDB is not available"

**Causes & Solutions:**

1. **CyborgDB container not running**
   ```powershell
   # Check container status
   docker ps | findstr cyborgdb
   
   # Solution: Restart container
   docker-compose restart cyborgdb
   
   # Check logs
   docker logs cyborgdb
   ```

2. **Encryption key mismatch**
   - If data was created with one key but you're using a different key
   - Solution: Use consistent `CYBORGDB_ENCRYPTION_KEY` or delete and recreate indexes

3. **Redis not responding**
   ```powershell
   # Check Redis
   docker logs redis
   
   # Test Redis connection
   docker exec -it redis redis-cli ping
   # Should return: PONG
   
   # Solution: Restart Redis
   docker-compose restart redis
   ```

---

### Issue 5: Authentication Fails

**Symptom:** "Invalid credentials" or "Token expired"

**Causes & Solutions:**

1. **Wrong password**
   - Default demo credentials:
     - Email: `dr.patel@mumbai.in`
     - Password: `rarenet2024`

2. **Token expired**
   - JWT tokens expire after 24 hours
   - Solution: Log in again

3. **User doesn't exist**
   ```powershell
   # Check user database
   cd backend
   python -c "import json; print(json.load(open('data/users.json')))"
   
   # Solution: Run seed script to create demo users
   python -m app.auth.router
   ```

---

### Issue 6: Search Returns No Results

**Symptom:** Searches always return "No diagnosis found" or privacy blocks

**Causes & Solutions:**

1. **Database not seeded**
   ```powershell
   cd backend
   
   # Check if data exists
   python scripts/verify_cyborg.py
   
   # Solution: Seed database
   python scripts/seed_privacy_data.py
   ```

2. **K-anonymity threshold too high**
   - Default threshold: k=5 (requires 5+ matching cases)
   - Your query might match fewer than 5 cases
   - Solution: Try common symptoms like "joint pain, fever, rash"

3. **Embedding model not loaded**
   ```powershell
   # Check backend logs for:
   # "Embedding model loaded successfully"
   
   # Solution: Model downloads on first run (700MB)
   # Wait for download to complete
   ```

---

### Issue 7: Slow Performance

**Symptom:** Searches take >10 seconds

**Causes & Solutions:**

1. **First query after startup**
   - Embedding model loads on first query (one-time delay)
   - Solution: Wait ~30 seconds for first query

2. **Docker resource limits**
   ```powershell
   # Solution: Increase Docker resources
   # Docker Desktop → Settings → Resources
   # Recommended: 4GB RAM, 2 CPUs
   ```

3. **Too many concurrent queries**
   - Privacy aggregator queries 8 hospitals
   - Solution: This is expected behavior

---

### Issue 8: Privacy Tests Fail

**Symptom:** `python scripts/test_privacy.py` shows failures

**Causes & Solutions:**

1. **Threshold test failures**
   - Ghost cases might have been modified
   - Solution: Reset database
     ```powershell
     cd backend
     python scripts/reset_db.py
     python scripts/seed_privacy_data.py
     python scripts/test_privacy.py
     ```

2. **Temporal test variance**
   - Noise makes results slightly different each time
   - Solution: Expected behavior if variance is small (<5%)

---

## Health Check Commands

### Quick Status Check
```powershell
# Check all services
docker-compose ps

# Check backend health
curl http://localhost:8001/health

# Check backend readiness
curl http://localhost:8001/ready

# Check CyborgDB
curl http://localhost:8000/health

# Check frontend
curl http://localhost:5173
```

### Reset Everything
```powershell
# Stop all services
docker-compose down

# Remove all data (WARNING: deletes all patient records)
docker-compose down -v

# Restart fresh
docker-compose up -d
cd backend
python scripts/seed_privacy_data.py
```

---

## Common Error Messages

### "address already in use"
- **Cause:** Port conflict
- **Solution:** Stop existing service or change port in config

### "module 'cyborgdb' has no attribute 'Client'"
- **Cause:** Wrong cyborgdb version
- **Solution:** `pip install cyborgdb==0.3.1`

### "connection refused"
- **Cause:** Service not started
- **Solution:** Check `docker-compose ps` and restart services

### "HIPAA validation failed"
- **Cause:** This is not a real error in RareNet (we don't have actual HIPAA validation)
- **Solution:** Check your query format

---

## Getting Help

### Before asking for help, provide:
1. **Your setup:**
   - OS (Windows/Mac/Linux)
   - Docker version (`docker --version`)
   - Python version (`python --version`)
   - Node version (`node --version`)

2. **What you tried:**
   - Exact commands you ran
   - Full error message (copy-paste, don't summarize)

3. **Logs:**
   ```powershell
   # Backend logs
   docker-compose logs backend
   
   # CyborgDB logs
   docker-compose logs cyborgdb
   
   # Redis logs
   docker-compose logs redis
   ```

### Contact
- **GitHub Issues:** [Create an issue](https://github.com/your-repo/issues)
- **Email:** aakanksha.singh0205@hackerearth.com

---

## Performance Benchmarks (Expected Values)

For reference, here's what normal performance looks like:

| Metric | Expected Value | Your Value |
|--------|----------------|------------|
| First query (model load) | 20-30 seconds | _____ |
| Subsequent queries | <200ms | _____ |
| Database seed time | 2-3 minutes | _____ |
| Docker startup | 1-2 minutes | _____ |
| Frontend load | <3 seconds | _____ |

If your values are significantly different, check the troubleshooting sections above.

---

**Last Updated:** December 26, 2025  
**RareNet Version:** 4.0
