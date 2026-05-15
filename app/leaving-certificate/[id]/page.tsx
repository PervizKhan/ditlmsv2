'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Certificate {
  studentName: string;
  fatherName: string;
  studentIdNo: string;
  program: string;
  leavingReason: string;
  lastAttendanceDate: string;
  conduct: string;
  characterCertificate: string;
  nextAdmissionClass: string;
  remarks: string;
  certificateId: string;
  issueDate: string;
}

export default function LeavingCertificatePage() {
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
        <div className="text-center text-red-500">Certificate not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 p-8 print:bg-white print:p-0">
      <div className="max-w-5xl mx-auto print:max-w-none">
        <div className="relative bg-white shadow-2xl print:shadow-none" style={{ 
          width: '100%', 
          minHeight: '650px',
          background: 'linear-gradient(135deg, #ffffff 0%, #fef9e6 100%)',
          border: '10px solid #d4af37',
          borderRadius: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          
          {/* Corner Graphics */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '120px',
            height: '120px',
            background: 'linear-gradient(135deg, #0b1f3a 0%, #1a4a6e 50%, #d4af37 100%)',
            clipPath: 'polygon(0 0, 100% 0, 0 100%)',
            opacity: 0.9
          }} />
          
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '120px',
            height: '120px',
            background: 'linear-gradient(225deg, #0b1f3a 0%, #1a4a6e 50%, #d4af37 100%)',
            clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
            opacity: 0.9
          }} />
          
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '120px',
            height: '120px',
            background: 'linear-gradient(45deg, #d4af37 0%, #1a4a6e 50%, #0b1f3a 100%)',
            clipPath: 'polygon(0 100%, 100% 100%, 0 0)',
            opacity: 0.9
          }} />
          
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '120px',
            height: '120px',
            background: 'linear-gradient(315deg, #d4af37 0%, #1a4a6e 50%, #0b1f3a 100%)',
            clipPath: 'polygon(100% 100%, 100% 0, 0 100%)',
            opacity: 0.9
          }} />

          {/* Border Lines */}
          <div style={{
            position: 'absolute',
            top: 20,
            left: 20,
            right: 20,
            bottom: 20,
            border: '2px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '12px',
            pointerEvents: 'none'
          }} />
          
          <div style={{
            position: 'absolute',
            top: 25,
            left: 25,
            right: 25,
            bottom: 25,
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '10px',
            pointerEvents: 'none'
          }} />

          {/* Main Content */}
          <div className="p-12 print:p-8" style={{ position: 'relative', zIndex: 2 }}>
            
            {/* Top Decoration */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ 
                display: 'inline-block',
                width: '60px',
                height: '2px',
                background: 'linear-gradient(90deg, #d4af37, #0b1f3a, #d4af37)',
                margin: '0 10px'
              }} />
              <span style={{ fontSize: '28px' }}>🎓</span>
              <div style={{ 
                display: 'inline-block',
                width: '60px',
                height: '2px',
                background: 'linear-gradient(90deg, #d4af37, #0b1f3a, #d4af37)',
                margin: '0 10px'
              }} />
            </div>
            
            {/* School Header */}
            <div className="text-center mb-4">
              <div className="text-4xl font-serif font-bold text-blue-900 tracking-wide">Oxford Public School & College</div>
              <div className="text-md font-serif text-gray-600 mt-1">TSD Dara Adam Khel | Affiliated with BISE Kohat</div>
            </div>
            
            {/* Gold Divider */}
            <div style={{
              height: '3px',
              background: 'linear-gradient(90deg, transparent, #d4af37, #d4af37, #d4af37, transparent)',
              width: '60%',
              margin: '10px auto'
            }} />
            
            {/* Certificate Title */}
            <div className="text-center my-6">
              <div className="text-5xl font-serif text-yellow-700 tracking-wider" style={{ 
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                fontFamily: "'Georgia', 'Times New Roman', serif"
              }}>SCHOOL LEAVING</div>
              <div className="text-2xl font-serif text-yellow-600 tracking-wide">CERTIFICATE</div>
            </div>
            
            {/* Certificate Number */}
            <div className="text-right mb-4">
              <div style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #d4af37, #b8941e)',
                padding: '4px 15px',
                borderRadius: '20px',
                color: '#0b1f3a',
                fontWeight: 'bold',
                fontSize: '11px'
              }}>
                Certificate No: {certificate.certificateId}
              </div>
            </div>
            
            {/* Certificate Body */}
            <div className="text-justify text-gray-800" style={{ 
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: '16px',
              lineHeight: '1.8'
            }}>
              <p style={{ marginBottom: '15px' }}>
                This is to certify that <span className="font-bold text-xl text-blue-900">{certificate.studentName}</span>, 
                Son/Daughter of <span className="font-semibold text-blue-800">{certificate.fatherName || '________'}</span>, 
                was a bonafide student of this institution bearing Registration No. 
                <span className="font-semibold ml-1">{certificate.studentIdNo || '________'}</span> 
                in the program of <span className="font-semibold">{certificate.program || '________'}</span>.
              </p>
              
              <p style={{ marginBottom: '15px' }}>
                He/She left the school on <span className="font-semibold text-blue-700">{new Date(certificate.lastAttendanceDate).toLocaleDateString()}</span> 
                due to <span className="font-semibold text-blue-700">{certificate.leavingReason}</span>. 
                During his/her stay, conduct was <span className="font-semibold text-green-700">{certificate.conduct}</span>.
              </p>
              
              {certificate.characterCertificate === 'Yes' && (
                <p style={{ marginBottom: '15px' }}>
                  He/She bears a good moral character and is recommended for further admission.
                  {certificate.nextAdmissionClass && (
                    <span> He/She is eligible for admission to <span className="font-semibold text-blue-700">{certificate.nextAdmissionClass}</span>.</span>
                  )}
                </p>
              )}
              
              {certificate.remarks && (
                <p className="italic text-gray-600">Remarks: {certificate.remarks}</p>
              )}
            </div>
            
            {/* Signature Section - ENHANCED VISIBILITY */}
            <div className="flex justify-between mt-10 pt-4">
              <div className="text-center" style={{ flex: 1 }}>
                <div style={{ borderTop: '2px solid #0b1f3a', width: '140px', margin: '0 auto', paddingTop: '6px' }} />
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0b1f3a', marginTop: '6px' }}>DATE</div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#d4af37', marginTop: '2px' }}>
                  {new Date(certificate.issueDate).toLocaleDateString()}
                </div>
              </div>
              
              <div className="text-center" style={{ flex: 1 }}>
                <div style={{ borderTop: '2px solid #0b1f3a', width: '180px', margin: '0 auto', paddingTop: '6px' }} />
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0b1f3a', marginTop: '6px' }}>PRINCIPAL'S SIGNATURE</div>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#1a4a6e', marginTop: '2px' }}>(Principal)</div>
              </div>
              
              <div className="text-center" style={{ flex: 1 }}>
                <div style={{ borderTop: '2px solid #0b1f3a', width: '100px', margin: '0 auto', paddingTop: '6px' }} />
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0b1f3a', marginTop: '6px' }}>SEAL</div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#d4af37', marginTop: '2px' }}>Oxford Public School</div>
              </div>
            </div>
            
            {/* Footer - ENHANCED VISIBILITY */}
            <div className="text-center mt-6 pt-3 border-t border-gray-300">
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0b1f3a', letterSpacing: '0.5px' }}>
                Oxford Public School & College, TSD Dara Adam Khel
              </div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#d4af37', marginTop: '4px', fontStyle: 'italic' }}>
                "Excellence in Education"
              </div>
            </div>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-6 print:hidden">
          <button onClick={handlePrint} className="px-8 py-3 text-lg font-semibold rounded-lg" style={{ background: 'var(--accent)', color: '#0b1f3a' }}>
            🖨️ Save as PDF / Print
          </button>
          <button onClick={() => window.close()} className="px-6 py-3 text-lg font-semibold rounded-lg border" style={{ borderColor: 'var(--border)' }}>
            Close
          </button>
        </div>
        
        <div className="text-center text-sm text-gray-500 mt-4 print:hidden">
          💡 Tip: Press <strong>Ctrl+P</strong> to save as PDF
        </div>
      </div>
    </div>
  );
}