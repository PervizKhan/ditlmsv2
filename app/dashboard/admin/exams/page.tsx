'use client';

import { useState, useEffect } from 'react';

interface Exam {
  _id: string;
  name: string;
  type: string;
  semester: string;
  academicYear: string;
  program: string;
  status: string;
  courses: any[];
}

interface Student {
  _id: string;
  name: string;
  studentId: string;
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [examData, setExamData] = useState<any>(null);
  const [marks, setMarks] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchExams();
    fetchStudents();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/admin/exams');
      const data = await res.json();
      setExams(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      const studentList = data.filter((u: any) => u.role === 'student');
      setStudents(studentList);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExamMarks = async (examId: string) => {
    setSelectedExam(examId);
    const exam = exams.find(e => e._id === examId);
    if (exam) {
      const res = await fetch(`/api/admin/exams/${examId}/marks`);
      const data = await res.json();
      setExamData(exam);
      
      // Initialize marks object
      const marksData: Record<string, Record<string, number>> = {};
      students.forEach(student => {
        marksData[student._id] = {};
        exam.courses.forEach((course: any) => {
          const existingMark = data.marks?.find((m: any) => m.studentId === student._id && m.courseId === course._id);
          marksData[student._id][course._id] = existingMark?.obtainedMarks || 0;
        });
      });
      setMarks(marksData);
    }
  };

  const updateMark = (studentId: string, courseId: string, value: number) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [courseId]: value,
      },
    }));
  };

  const saveMarks = async () => {
    setSaving(true);
    try {
      const payload = {
        examId: selectedExam,
        marks: Object.entries(marks).map(([studentId, courseMarks]) => ({
          studentId,
          marks: Object.entries(courseMarks).map(([courseId, obtainedMarks]) => ({
            courseId,
            obtainedMarks,
          })),
        })),
      };
      
      const res = await fetch('/api/admin/exams/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        alert('Marks saved successfully!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  const generateDMCFromExam = async () => {
    if (!selectedExam) return;
    
    const res = await fetch('/api/admin/generate-dmc-from-exam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examId: selectedExam }),
    });
    
    const data = await res.json();
    if (data.success) {
      alert(`✅ Generated ${data.generated} DMCs successfully!`);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--accent)' }}>📝 Exam Marks Entry</h1>
      
      {/* Exam Selection */}
      <div className="mb-6">
        <label className="label">Select Exam</label>
        <select
          className="input max-w-md"
          value={selectedExam}
          onChange={(e) => loadExamMarks(e.target.value)}
        >
          <option value="">Select an exam</option>
          {exams.map(exam => (
            <option key={exam._id} value={exam._id}>
              {exam.name} - {exam.program} ({exam.semester}) - {exam.academicYear}
            </option>
          ))}
        </select>
      </div>

      {/* Marks Entry Table */}
      {selectedExam && examData && (
        <>
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{examData.name}</h2>
              <p className="text-sm text-gray-500">
                {examData.program} | {examData.semester} | {examData.academicYear}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={saveMarks} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : '💾 Save Marks'}
              </button>
              <button onClick={generateDMCFromExam} className="btn-secondary">
                📜 Generate DMCs
              </button>
            </div>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">ID</th>
                    {examData.courses.map((course: any) => (
                      <th key={course._id} className="p-3 text-center">
                        {course.code}<br/>
                        <span className="text-xs text-gray-500">/{course.totalMarks || 100}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <td className="p-3">{student.name}</td>
                      <td className="p-3">{student.studentId}</td>
                      {examData.courses.map((course: any) => (
                        <td key={course._id} className="p-3 text-center">
                          <input
                            type="number"
                            className="w-20 px-2 py-1 rounded border text-center"
                            style={{ background: 'var(--input-bg)', borderColor: 'var(--border)' }}
                            value={marks[student._id]?.[course._id] || ''}
                            onChange={(e) => updateMark(student._id, course._id, parseInt(e.target.value) || 0)}
                            min="0"
                            max={course.totalMarks || 100}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}