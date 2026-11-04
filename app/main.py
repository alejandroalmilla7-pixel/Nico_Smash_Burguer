from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app.database import engine, Base
from app.routers import  pedidos

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Hamburguesería API")

app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")

# Registrar Routers
app.include_router(pedidos.router)

# Vista Cliente
@app.get("/", response_class=HTMLResponse)
def read_root(request: Request):
    return templates.TemplateResponse(request, "index.html", {})

# Vista Administrador
@app.get("/admin", response_class=HTMLResponse)
def read_admin(request: Request):
    return templates.TemplateResponse(request, "admin.html", {})