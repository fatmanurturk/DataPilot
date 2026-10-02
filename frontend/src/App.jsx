import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    setSelectedFile(file);
    setAnalysis(null);
    setError("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Lütfen bir Excel veya CSV dosyası seçin.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(
        "http://127.0.0.1:8000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setAnalysis(response.data);
    } catch (err) {
      console.error(err);
      setError("Dosya analiz edilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="content">
        <h1>DataPilot</h1>

        <p className="subtitle">
          Excel ve CSV dosyalarınızı yükleyin, verilerinizi analiz edin.
        </p>

        <div className="upload-card">
          <input
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFileChange}
          />

          {selectedFile && (
            <p>
              Seçilen dosya: <strong>{selectedFile.name}</strong>
            </p>
          )}

          <button onClick={handleUpload} disabled={loading}>
            {loading ? "Analiz ediliyor..." : "Dosyayı Analiz Et"}
          </button>

          {error && <p className="error-message">{error}</p>}
        </div>

        {analysis && (
          <div className="analysis-section">
            <h2>Analiz Sonucu</h2>

            <div className="summary-cards">
              <div className="summary-card">
                <span>Satır</span>
                <strong>{analysis.row_count}</strong>
              </div>

              <div className="summary-card">
                <span>Sütun</span>
                <strong>{analysis.column_count}</strong>
              </div>

              <div className="summary-card">
                <span>Sorun</span>
                <strong>{analysis.issues.length}</strong>
              </div>
            </div>

            <div className="section-card">
              <h3>Dosya Bilgileri</h3>

              <p>
                <strong>Dosya:</strong> {analysis.filename}
              </p>

              <p>
                <strong>Sütunlar:</strong>{" "}
                {analysis.columns.join(", ")}
              </p>
            </div>

            <div className="section-card">
              <h3>Veri Sorunları</h3>

              {analysis.issues.length === 0 ? (
                <p>Herhangi bir veri sorunu bulunamadı.</p>
              ) : (
                <ul>
                  {analysis.issues.map((issue, index) => (
                    <li key={index}>
                      {issue.type === "missing_value" &&
                        `${issue.row}. satırda "${issue.column}" değeri eksik.`}

                      {issue.type === "duplicate_row" &&
                        `${issue.row}. satır tekrar eden kayıt.`}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="section-card">
              <h3>Sayısal İstatistikler</h3>

              {Object.entries(analysis.numeric_summary).map(
                ([column, stats]) => (
                  <div className="stat-block" key={column}>
                    <h4>{column}</h4>

                    <p>Minimum: {stats.min}</p>
                    <p>Maksimum: {stats.max}</p>
                    <p>Ortalama: {stats.mean.toFixed(2)}</p>
                    <p>Medyan: {stats.median}</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;