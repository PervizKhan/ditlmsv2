'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Certificate {
  studentName: string;
  courseName: string;
  courseCode: string;
  grade: string;
  percentage: number;
  issueDate: string;
  certificateId: string;
  fatherName?: string;
}

export default function CertificatePage() {
  const params = useParams();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificate();
  }, []);

  const fetchCertificate = async () => {
    try {
      const res = await fetch(`/api/certificates/${params.id}`);
      const data = await res.json();
      setCertificate(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading certificate...</div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Certificate not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto print:max-w-none">
        {/* Certificate Card */}
        <div className="relative bg-white shadow-2xl print:shadow-none" style={{ border: '15px solid #d4af37', borderRadius: '20px' }}>
          
          {/* Decorative Inner Border */}
          <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-double border-yellow-600 pointer-events-none" style={{ borderRadius: '12px' }} />
          
          <div className="p-12 print:p-8">
            
            {/* School Header */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-2">🏫</div>
              <div className="text-3xl font-bold text-blue-900">Oxford Public School & College</div>
              <div className="text-md font-semibold text-gray-700">TSD Dara Adam Khel</div>
              <div className="text-sm text-gray-500">(Affiliated with BISE Kohat)</div>
              <div className="w-24 h-0.5 bg-yellow-600 mx-auto my-3"></div>
            </div>
            
            {/* Certificate Title */}
            <div className="text-center my-8">
              <div className="text-5xl font-serif text-yellow-700">CERTIFICATE</div>
              <div className="text-2xl font-serif text-yellow-600">OF COMPLETION</div>
            </div>
            
            {/* Certificate Number */}
            <div className="text-right text-sm mb-4">
              <span className="font-semibold">Certificate No:</span> {certificate.certificateId}
            </div>
            
            {/* Body */}
            <div className="text-center leading-8 text-gray-700">
              <p className="mb-4">This is to certify that</p>
              <p className="text-3xl font-bold text-blue-900 my-4">{certificate.studentName}</p>
              {certificate.fatherName && (
                <p className="mb-2">Son/Daughter of <span className="font-semibold">{certificate.fatherName}</span></p>
              )}
              <p className="mb-6">has successfully completed the course</p>
              <p className="text-xl font-bold text-blue-800 my-4">
                {certificate.courseName} ({certificate.courseCode})
              </p>
            </div>
            
            {/* Grade and Percentage */}
            <div className="flex justify-center gap-8 my-8">
              <div className="text-center">
                <div className="text-sm text-gray-500">Grade Obtained</div>
                <div className="text-2xl font-bold text-green-600">{certificate.grade}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Percentage</div>
                <div className="text-2xl font-bold text-blue-600">{certificate.percentage}%</div>
              </div>
            </div>
            
            {/* Signature Section */}
            <div className="flex justify-between mt-12 pt-4">
              <div className="text-center">
                <div className="border-t-2 border-gray-400 pt-2 w-40">Date</div>
                <div className="text-sm mt-1">{new Date(certificate.issueDate).toLocaleDateString()}</div>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-gray-400 pt-2 w-48">Principal's Signature</div>
                <div className="text-sm mt-1">(Principal)</div>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-gray-400 pt-2 w-40">Seal</div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="text-center mt-8 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-400">Oxford Public School & College, TSD Dara Adam Khel</div>
              <div className="text-xs text-gray-400">Excellence in Education</div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-6 print:hidden">
          <button onClick={handlePrint} className="px-6 py-3 text-lg font-semibold rounded-lg" style={{ background: 'var(--accent)', color: '#0b1f3a' }}>
            🖨️ Save as PDF / Print
          </button>
          <button onClick={() => window.close()} className="px-6 py-3 text-lg font-semibold rounded-lg border" style={{ borderColor: 'var(--border)' }}>
            Close
          </button>
        </div>
        
        <div className="text-center text-sm text-gray-500 mt-4 print:hidden">
          💡 Tip: Press <strong>Ctrl+P</strong> (Windows) or <strong>Cmd+P</strong> (Mac) to save as PDF
        </div>
      </div>
    </div>
  );
}