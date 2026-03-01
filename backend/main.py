from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.save_user import router as save_user_router
from src.api.login import router as login_router
from src.api.citizen_dashboard import router as citizen_router
from src.api.admin_dashboard import router as admin_router
from src.api.auth import router as auth_router
from src.api.report import router as report_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(save_user_router, prefix="/api")
app.include_router(login_router, prefix="/api")
app.include_router(citizen_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(report_router, prefix="/api")