from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from io import BytesIO

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "DataPilot API çalışıyor"
    }


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()

    if file.filename.endswith(".xlsx"):
        df = pd.read_excel(BytesIO(contents))

    elif file.filename.endswith(".csv"):
        df = pd.read_csv(BytesIO(contents))

    else:
        return {
            "error": "Sadece CSV ve Excel dosyaları destekleniyor."
        }

    return {
        "filename": file.filename,
        "row_count": len(df),
        "column_count": len(df.columns),
        "columns": df.columns.tolist()
    }