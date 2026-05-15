'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface DMCSubject {
  subjectCode: string;
  subjectName: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  status: string;
}

interface DMCData {
  studentName: string;
  studentIdNo: string;
  program: string;
  semester: string;
  examType: string;
  academicYear: string;
  subjects: DMCSubject[];
  totalMarks: number;
  obtainedMarks: number;
  overallPercentage: number;
  overallGrade: string;
  overallStatus: string;
  remarks?: string;
  issueDate: string;
  dmcId: string;
}

export default function DMCPage() {
  const params = useParams();
  const [dmc, setDMC] = useState<DMCData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDMC();
  }, []);

  const fetchDMC = async () => {
    try {
      const res = await fetch(`/api/admin/dmc/${params.id}`);
      const data = await res.json();
      setDMC(data);
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
        <div className="text-center">Loading DMC...</div>
      </div>
    );
  }

  if (!dmc) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">DMC not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 p-8 print:bg-white print:p-0">
      <div className="max-w-5xl mx-auto print:max-w-none">
        {/* DMC Container */}
        <div className="relative bg-white shadow-2xl print:shadow-none" style={{ 
          width: '100%', 
          background: '#ffffff',
          border: '10px solid #d4af37',
          borderRadius: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          
          {/* Decorative Corners */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100px', height: '100px',
            background: 'linear-gradient(135deg, #0b1f3a 0%, #1a4a6e 50%, #d4af37 100%)',
            clipPath: 'polygon(0 0, 100% 0, 0 100%)', opacity: 0.9
          }} />
          <div style={{
            position: 'absolute', top: 0, right: 0, width: '100px', height: '100px',
            background: 'linear-gradient(225deg, #0b1f3a 0%, #1a4a6e 50%, #d4af37 100%)',
            clipPath: 'polygon(100% 0, 100% 100%, 0 0)', opacity: 0.9
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, width: '100px', height: '100px',
            background: 'linear-gradient(45deg, #d4af37 0%, #1a4a6e 50%, #0b1f3a 100%)',
            clipPath: 'polygon(0 100%, 100% 100%, 0 0)', opacity: 0.9
          }} />
          <div style={{
            position: 'absolute', bottom: 0, right: 0, width: '100px', height: '100px',
            background: 'linear-gradient(315deg, #d4af37 0%, #1a4a6e 50%, #0b1f3a 100%)',
            clipPath: 'polygon(100% 100%, 100% 0, 0 100%)', opacity: 0.9
          }} />

          {/* Border Lines */}
          <div style={{ position: 'absolute', top: 15, left: 15, right: 15, bottom: 15, border: '2px solid rgba(212, 175, 55, 0.3)', borderRadius: '12px', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 20, left: 20, right: 20, bottom: 20, border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '10px', pointerEvents: 'none' }} />

          {/* Content */}
          <div className="p-10 print:p-8" style={{ position: 'relative', zIndex: 2 }}>
            
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-blue-900">Oxford Public School & College</div>
              <div className="text-md text-gray-600 mt-1">TSD Dara Adam Khel | Affiliated with BISE Kohat</div>
              <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #d4af37, #d4af37, #d4af37, transparent)', width: '50%', margin: '12px auto' }} />
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-yellow-700">DETAILED MARKS CERTIFICATE</div>
              <div className="text-base text-gray-700 font-medium mt-1">{dmc.examType} Examination {dmc.academicYear}</div>
            </div>

            {/* Student Info - White background for readability */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
              <div><span className="font-bold text-gray-800">Student Name:</span> <span className="text-gray-900">{dmc.studentName}</span></div>
              <div><span className="font-bold text-gray-800">Registration No:</span> <span className="text-gray-900">{dmc.studentIdNo}</span></div>
              <div><span className="font-bold text-gray-800">Program:</span> <span className="text-gray-900">{dmc.program}</span></div>
              <div><span className="font-bold text-gray-800">Semester:</span> <span className="text-gray-900">{dmc.semester}</span></div>
              <div><span className="font-bold text-gray-800">DMC No:</span> <span className="text-gray-900">{dmc.dmcId}</span></div>
              <div><span className="font-bold text-gray-800">Issue Date:</span> <span className="text-gray-900">{new Date(dmc.issueDate).toLocaleDateString()}</span></div>
            </div>

            {/* Marks Table - Enhanced visibility */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-center border-collapse border-2 border-gray-400">
                <thead>
                  <tr style={{ background: '#0b1f3a' }}>
                    <th className="p-2 border border-gray-400 text-white font-bold">S.No</th>
                    <th className="p-2 border border-gray-400 text-white font-bold">Subject Code</th>
                    <th className="p-2 border border-gray-400 text-white font-bold">Subject Name</th>
                    <th className="p-2 border border-gray-400 text-white font-bold">Total Marks</th>
                    <th className="p-2 border border-gray-400 text-white font-bold">Obtained Marks</th>
                    <th className="p-2 border border-gray-400 text-white font-bold">Percentage</th>
                    <th className="p-2 border border-gray-400 text-white font-bold">Grade</th>
                    <th className="p-2 border border-gray-400 text-white font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dmc.subjects.map((subject, idx) => (
                    <tr key={idx} className="border border-gray-300 hover:bg-gray-50">
                      <td className="p-2 border border-gray-300 text-gray-900">{idx + 1}</td>
                      <td className="p-2 border border-gray-300 text-gray-900 font-mono">{subject.subjectCode}</td>
                      <td className="p-2 border border-gray-300 text-left text-gray-900">{subject.subjectName}</td>
                      <td className="p-2 border border-gray-300 text-gray-900">{subject.totalMarks}</td>
                      <td className="p-2 border border-gray-300 text-gray-900 font-semibold">{subject.obtainedMarks}</td>
                      <td className="p-2 border border-gray-300 text-gray-900">{subject.percentage}%</td>
                      <td className="p-2 border border-gray-300 text-gray-900 font-bold">{subject.grade}</td>
                      <td className="p-2 border border-gray-300">
                        <span className={`font-bold px-2 py-1 rounded ${subject.status === 'Pass' ? 'text-green-700' : 'text-red-700'}`}>
                          {subject.status}
                        </span>
                       </td>
                     </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#f0f0f0' }}>
                    <td colSpan={3} className="p-2 border border-gray-400 font-bold text-right text-gray-900">Total:</td>
                    <td className="p-2 border border-gray-400 font-bold text-gray-900">{dmc.totalMarks}</td>
                    <td className="p-2 border border-gray-400 font-bold text-gray-900">{dmc.obtainedMarks}</td>
                    <td className="p-2 border border-gray-400 font-bold text-gray-900">{dmc.overallPercentage}%</td>
                    <td className="p-2 border border-gray-400 font-bold text-gray-900">{dmc.overallGrade}</td>
                    <td className="p-2 border border-gray-400">
                      <span className={`font-bold px-3 py-1 rounded ${dmc.overallStatus === 'Pass' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                        {dmc.overallStatus}
                      </span>
                    </td>
                   </tr>
                </tfoot>
              </table>
            </div>

            {/* Result Summary */}
            <div className="text-center mb-4">
              <div className={`inline-block p-3 rounded-lg ${dmc.overallStatus === 'Pass' ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'}`}>
                <span className={`text-lg font-bold ${dmc.overallStatus === 'Pass' ? 'text-green-800' : 'text-red-800'}`}>
                  RESULT: {dmc.overallStatus}
                </span>
              </div>
            </div>

            {dmc.remarks && (
              <div className="text-center text-gray-700 italic mb-4">Remarks: {dmc.remarks}</div>
            )}

            {/* Signature */}
            <div className="flex justify-between mt-8 pt-4">
              <div className="text-center">
                <div className="border-t-2 border-gray-800 w-40 pt-2"></div>
                <div className="text-sm font-semibold text-gray-800 mt-1">Controller of Examinations</div>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-gray-800 w-40 pt-2"></div>
                <div className="text-sm font-semibold text-gray-800 mt-1">Principal's Signature</div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-6 pt-3 border-t border-gray-300">
              <div className="text-sm font-medium text-gray-700">Oxford Public School & College, TSD Dara Adam Khel</div>
              <div className="text-xs text-gray-500 mt-1">"Excellence in Education"</div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-6 print:hidden">
          <button onClick={handlePrint} className="px-8 py-3 text-lg font-semibold rounded-lg" style={{ background: 'var(--accent)', color: '#0b1f3a' }}>
            🖨️ Print DMC / Save as PDF
          </button>
          <button onClick={() => window.close()} className="px-6 py-3 text-lg font-semibold rounded-lg border" style={{ borderColor: 'var(--border)' }}>
            Close
          </button>
        </div>
        <div className="text-center text-sm text-gray-500 mt-4 print:hidden">
          💡 Tip: Press Ctrl+P to save as PDF
        </div>
      </div>
    </div>
  );
}