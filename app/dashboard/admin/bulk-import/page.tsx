'use client';

import { useState } from 'react';

export default function BulkImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [preview, setPreview] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      previewCSV(selectedFile);
    }
  };

  const previewCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').slice(0, 6);
      const rows = lines.map(line => line.split(','));
      setPreview(rows.filter(r => r.length > 1));
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/admin/bulk-import', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: 'Upload failed' });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `name,email,password,role,studentId,program,parentEmail
Ali Khan,ali@example.com,password123,student,STU001,BS Computer Science,parent@example.com
Sara Ahmed,sara@example.com,password123,student,STU002,BS Mathematics,sara.parent@example.com`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--accent)' }}>📥 Bulk Import Students</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Import Section */}
        <div className="p-6 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold mb-4">Import Students from CSV</h2>
          
          <button onClick={downloadTemplate} className="mb-4 btn-secondary text-sm">
            📥 Download CSV Template
          </button>
          
          <div className="border-2 border-dashed rounded-lg p-6 text-center mb-4" style={{ borderColor: 'var(--border)' }}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full"
            />
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
              Upload CSV file with student data
            </p>
          </div>
          
          {file && (
            <div className="mb-4">
              <p className="text-sm"><strong>File:</strong> {file.name}</p>
              <p className="text-sm"><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
            </div>
          )}
          
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="btn-primary w-full"
          >
            {loading ? 'Importing...' : 'Import Students'}
          </button>
        </div>
        
        {/* Results Section */}
        {result && (
          <div className="p-6 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <h2 className="text-lg font-semibold mb-4">Import Results</h2>
            {result.success ? (
              <div>
                <div className="text-green-500 text-2xl mb-2">✓ Import Complete</div>
                <p><strong>Total:</strong> {result.total}</p>
                <p><strong>Success:</strong> {result.successCount}</p>
                <p><strong>Failed:</strong> {result.errorCount}</p>
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-4">
                    <p className="font-semibold">Errors:</p>
                    <ul className="text-sm text-red-500">
                      {result.errors.slice(0, 5).map((err: string, i: number) => (
                        <li key={i}>• {err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-red-500">Error: {result.error}</div>
            )}
          </div>
        )}
      </div>
      
      {/* Preview Section */}
      {preview.length > 0 && (
        <div className="mt-6 p-6 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold mb-4">Preview (First 5 rows)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-b" style={{ borderColor: 'var(--border)' }}>
                    {row.map((cell: string, j: number) => (
                      <td key={j} className="p-2" style={{ color: 'var(--text-secondary)' }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Instructions */}
      <div className="mt-6 p-6 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <h3 className="font-semibold mb-2">📋 CSV Format Instructions</h3>
        <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
          <li>• First row must be headers: <code>name,email,password,role,studentId,program,parentEmail</code></li>
          <li>• <strong>name</strong> - Student's full name (required)</li>
          <li>• <strong>email</strong> - Student/Parent email (required, unique)</li>
          <li>• <strong>password</strong> - Temporary password (required)</li>
          <li>• <strong>role</strong> - <code>student</code> or <code>admin</code> (default: student)</li>
          <li>• <strong>studentId</strong> - Unique student ID (required)</li>
          <li>• <strong>program</strong> - Program name (e.g., BS Computer Science)</li>
          <li>• <strong>parentEmail</strong> - Parent email for notifications (optional)</li>
        </ul>
      </div>
    </div>
  );
}