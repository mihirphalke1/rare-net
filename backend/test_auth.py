"""
MINIMAL WORKING AUTH - NO DEPENDENCIES, NO MODELS, JUST WORKS
"""
from fastapi import FastAPI, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"status": "healthy"}

@app.post("/auth/login")
async def login(data: dict = Body(...)):
    print(f"🔥🔥🔥 LOGIN HIT: {data}")
    email = data.get("email")
    password = data.get("password")
    
    # Simple validation
    if email == "doctor@mumbai.hospital" and password == "password123":
        return {
            "access_token": "fake_token_12345",
            "refresh_token": "fake_refresh_67890",
            "token_type": "bearer",
            "expires_in": 86400,
            "user": {
                "id": "1",
                "email": email,
                "role": "doctor",
                "hospital": "mumbai",
                "full_name": "Dr. Test",
                "is_active": True
            }
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)
