from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app.database import engine, Base, SessionLocal
from app.routers import productos, pedidos
from app.routers.productos import sembrar_productos_iniciales

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicialización de esquemas en DB y seeder de arranque
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        sembrar_productos_iniciales(db)
    finally:
        db.close()
    yield

app = FastAPI(title="Nico Smash API", lifespan=lifespan)

app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")

app.include_router(productos.router)
app.include_router(pedidos.router)

@app.get("/", response_class=HTMLResponse)
def read_root(request: Request):
    return templates.TemplateResponse(request, "index.html", {})

@app.get("/admin", response_class=HTMLResponse)
def read_admin(request: Request):
    return templates.TemplateResponse(request, "admin.html", {})