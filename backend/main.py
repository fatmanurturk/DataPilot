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

    # Eksik değer sayılarını bul
    missing_values = df.isnull().sum().to_dict()

    # Tekrar eden satır sayısını bul
    duplicate_rows = int(df.duplicated().sum())

    # Sütunların veri tiplerini bul
    data_types = {
        column: str(dtype)
        for column, dtype in df.dtypes.items()
    }

    # Sayısal sütunların temel istatistiklerini hesapla
    numeric_summary = {}

    for column in df.select_dtypes(include="number").columns:
        numeric_summary[column] = {
            "min": float(df[column].min()),
            "max": float(df[column].max()),
            "mean": float(df[column].mean()),
            "median": float(df[column].median())
        }

    # Metin sütunlarındaki benzersiz değer sayılarını bul
    unique_values = {}

    for column in df.select_dtypes(include="object").columns:
        unique_values[column] = int(df[column].nunique())

    # Veri sorunlarının konumlarını tut
    issues = []

    # Eksik değerlerin hangi satır ve sütunda olduğunu bul
    for row_index, row in df.iterrows():
        for column in df.columns:
            if pd.isna(row[column]):
                issues.append({
                    "row": int(row_index + 2),
                    "column": column,
                    "type": "missing_value"
                })

    # Tekrar eden satırların konumlarını bul
    duplicate_mask = df.duplicated()

    for row_index, is_duplicate in duplicate_mask.items():
        if is_duplicate:
            issues.append({
                "row": int(row_index + 2),
                "type": "duplicate_row"
            })

    return {
        "filename": file.filename,
        "row_count": len(df),
        "column_count": len(df.columns),
        "columns": df.columns.tolist(),
        "missing_values": missing_values,
        "duplicate_rows": duplicate_rows,
        "data_types": data_types,
        "numeric_summary": numeric_summary,
        "unique_values": unique_values,
        "issues": issues
    }