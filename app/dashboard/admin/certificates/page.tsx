'use client';

import { useState, useEffect } from 'react';

interface Student {
  _id: string;
  name: string;
  email: string;
  studentId: string;
  program: string;
  fatherName?: string;
}

export default function LeavingCertificatePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedCertId, setGeneratedCertId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    leavingReason: '',
    lastAttendanceDate: new Date().toISOString().split('T')[0],
    conduct: 'Good',
    characterCertificate: 'Yes',
    nextAdmissionClass: '',
    remarks: '',
    leavingCertificateNumber: `LC-${Date.now()}`,
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, selectedClass, students]);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      console.log('Fetched students:', data);
      
      const studentList = data.filter((u: any) => u.role === 'student');
      
      // Map the data to ensure all fields are present
      const mappedStudents = studentList.map((student: any) => ({
        _id: student._id || student.id,
        name: student.name || '',
        email: student.email || '',
        studentId: student.studentId || '',
        program: student.program || '',
        fatherName: student.fatherName || '',
      }));
      
      console.log('Mapped students:', mappedStudents);
      setStudents(mappedStudents);
      
      // Extract unique classes/programs
      const uniqueClasses = [...new Set(mappedStudents.map((s: any) => s.program).filter(Boolean))] as string[];
      setClasses(uniqueClasses);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];
    
    // 1. Filter by Program/Class
    if (selectedClass && selectedClass !== "") {
      filtered = filtered.filter(s => 
        s.program?.trim() === selectedClass.trim()
      );
    }
    
    // 2. Filter by Search Term
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(s => {
        return (
          s.name?.toLowerCase().includes(term) ||
          s.studentId?.toLowerCase().includes(term) ||
          s.email?.toLowerCase().includes(term)
        );
      });
    }
    
    setFilteredStudents(filtered);
  };

  const handleSelectStudent = (student: Student) => {
    console.log('Selected student:', student);
    setSelectedStudent(student);
    setGeneratedCertId(null);
    setFormData({
      ...formData,
      leavingCertificateNumber: `LC-${Date.now()}`,
    });
  };

  const generateCertificate = async () => {
    if (!selectedStudent) {
      alert('Please select a student');
      return;
    }
    if (!formData.leavingReason) {
      alert('Please select a reason for leaving');
      return;
    }

    setGenerating(true);
    try {
      const payload = {
        studentId: selectedStudent._id,
        studentName: selectedStudent.name,
        fatherName: selectedStudent.fatherName || '',
        studentIdNo: selectedStudent.studentId || '',
        program: selectedStudent.program || '',
        leavingReason: formData.leavingReason,
        lastAttendanceDate: formData.lastAttendanceDate,
        conduct: formData.conduct,
        characterCertificate: formData.characterCertificate,
        nextAdmissionClass: formData.nextAdmissionClass,
        remarks: formData.remarks,
        leavingCertificateNumber: formData.leavingCertificateNumber,
      };
      
      console.log('Sending payload:', payload);
      
      const res = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      console.log('Response:', data);
      
      if (res.ok && data.success) {
        setGeneratedCertId(data.certificate.id);
        alert('✅ Leaving Certificate generated successfully!');
      } else {
        alert('Failed to generate certificate: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate certificate');
    } finally {
      setGenerating(false);
    }
  };

  const openCertificate = () => {
    if (generatedCertId) {
      window.open(`/leaving-certificate/${generatedCertId}`, '_blank');
    }
  };

  const clearSelection = () => {
    setSelectedStudent(null);
    setGeneratedCertId(null);
    setFormData({
      leavingReason: '',
      lastAttendanceDate: new Date().toISOString().split('T')[0],
      conduct: 'Good',
      characterCertificate: 'Yes',
      nextAdmissionClass: '',
      remarks: '',
      leavingCertificateNumber: `LC-${Date.now()}`,
    });
  };

  if (loading) {
    return <div className="text-center py-12">Loading students...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--accent)' }}>📜 School Leaving Certificate</h1>
      
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Panel - Student Selection */}
        <div className="p-6 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold mb-4">1. Select Student</h2>
          
          <div className="mb-4">
            <label className="label">Filter by Class</label>
            <select
              className="input"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {classes.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="label">Search Student</label>
            <input
              type="text"
              className="input"
              placeholder="Search by name, ID or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="max-h-96 overflow-y-auto border rounded-lg" style={{ borderColor: 'var(--border)' }}>
            {filteredStudents.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No students found</div>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student._id}
                  onClick={() => handleSelectStudent(student)}
                  className={`p-3 cursor-pointer transition-colors border-b ${
                    selectedStudent?._id === student._id
                      ? 'bg-accent/20 border-accent'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="font-semibold">{student.name}</div>
                  <div className="text-xs text-gray-500">ID: {student.studentId || 'Not set'}</div>
                  <div className="text-xs text-gray-500">Class: {student.program || 'Not set'}</div>
                  <div className="text-xs text-gray-500">Father: {student.fatherName || 'Not set'}</div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Right Panel - Certificate Details */}
        <div className="p-6 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold mb-4">2. Certificate Details</h2>
          
          {!selectedStudent ? (
            <div className="text-center py-12 text-gray-500">👈 Select a student from the left panel</div>
          ) : (
            <>
              <div className="mb-6 p-4 rounded-lg bg-accent/10 border border-accent/30">
                <div className="font-semibold text-lg">{selectedStudent.name}</div>
                <div className="text-sm">ID: {selectedStudent.studentId || 'Not set'}</div>
                <div className="text-sm">Class: {selectedStudent.program || 'Not set'}</div>
                <div className="text-sm">Father: {selectedStudent.fatherName || 'Not set'}</div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="label">Certificate No</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.leavingCertificateNumber}
                    onChange={(e) => setFormData({...formData, leavingCertificateNumber: e.target.value})}
                  />
                </div>

                <div>
                  <label className="label">Reason for Leaving *</label>
                  <select
                    className="input"
                    value={formData.leavingReason}
                    onChange={(e) => setFormData({...formData, leavingReason: e.target.value})}
                    required
                  >
                    <option value="">Select reason</option>
                    <option value="Completed Studies">Completed Studies</option>
                    <option value="Transfer to Another School">Transfer to Another School</option>
                    <option value="Family Relocation">Family Relocation</option>
                    <option value="Financial Issues">Financial Issues</option>
                    <option value="Medical Reasons">Medical Reasons</option>
                    <option value="Personal Reasons">Personal Reasons</option>
                  </select>
                </div>

                <div>
                  <label className="label">Last Attendance Date</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.lastAttendanceDate}
                    onChange={(e) => setFormData({...formData, lastAttendanceDate: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Conduct</label>
                    <select
                      className="input"
                      value={formData.conduct}
                      onChange={(e) => setFormData({...formData, conduct: e.target.value})}
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Satisfactory">Satisfactory</option>
                      <option value="Fair">Fair</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Character Certificate</label>
                    <select
                      className="input"
                      value={formData.characterCertificate}
                      onChange={(e) => setFormData({...formData, characterCertificate: e.target.value})}
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Next Admission Class</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Class 11, BS Computer Science"
                    value={formData.nextAdmissionClass}
                    onChange={(e) => setFormData({...formData, nextAdmissionClass: e.target.value})}
                  />
                </div>

                <div>
                  <label className="label">Remarks</label>
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="Additional remarks..."
                    value={formData.remarks}
                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={generateCertificate}
                    disabled={generating || !formData.leavingReason}
                    className="btn-primary flex-1"
                  >
                    {generating ? 'Generating...' : '📜 Generate Certificate'}
                  </button>
                  <button onClick={clearSelection} className="btn-secondary">Clear</button>
                </div>

                {generatedCertId && (
                  <div className="mt-4 p-4 rounded-lg bg-green-50 border border-green-300">
                    <p className="text-green-700 font-semibold mb-2 text-center">✅ Certificate Generated!</p>
                    <button onClick={openCertificate} className="btn-primary w-full">🔗 View Certificate</button>
                    <p className="text-xs text-gray-500 mt-3 text-center">Press Ctrl+P to save as PDF</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}