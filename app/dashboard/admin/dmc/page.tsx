'use client';

import { useState, useEffect } from 'react';

interface Student {
  _id: string;
  name: string;
  studentId: string;
  program: string;
}

interface Subject {
  code: string;
  name: string;
  totalMarks: number;
  obtainedMarks: number;
}

export default function DMCPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [programs, setPrograms] = useState<string[]>([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('Final Term');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [subjects, setSubjects] = useState<Subject[]>([
    { code: '', name: '', totalMarks: 100, obtainedMarks: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      const studentList = data.filter((u: any) => u.role === 'student');
      setStudents(studentList);
      
      const uniquePrograms = [...new Set(studentList.map((s: any) => s.program).filter(Boolean))] as string[];
      setPrograms(uniquePrograms);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProgram) {
      const filtered = students.filter(s => s.program === selectedProgram);
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [selectedProgram, students]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s._id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectStudent = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const addSubject = () => {
    setSubjects([...subjects, { code: '', name: '', totalMarks: 100, obtainedMarks: 0 }]);
  };

  const removeSubject = (index: number) => {
    const newSubjects = [...subjects];
    newSubjects.splice(index, 1);
    setSubjects(newSubjects);
  };

  const updateSubject = (index: number, field: keyof Subject, value: any) => {
    const newSubjects = [...subjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    setSubjects(newSubjects);
  };

  const generateDMCs = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }

    if (!selectedSemester) {
      alert('Please select semester');
      return;
    }

    const invalidSubjects = subjects.filter(s => !s.code || !s.name);
    if (invalidSubjects.length > 0) {
      alert('Please fill all subject codes and names');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/admin/generate-dmc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          program: selectedProgram,
          semester: selectedSemester,
          examType: selectedExamType,
          academicYear,
          subjects: subjects.map(s => ({
            code: s.code,
            name: s.name,
            totalMarks: s.totalMarks,
            obtainedMarks: s.obtainedMarks,
          })),
          studentIds: selectedStudents,
        }),
      });
      
      const data = await res.json();
      setResults(data);
      
      if (data.success) {
        alert(`✅ Generated ${data.generated} DMCs successfully!`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate DMCs');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--accent)' }}>📊 Generate DMCs</h1>
      
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Panel - Configuration */}
        <div className="p-6 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold mb-4">1. Exam Configuration</h2>
          
          <div className="space-y-4">
           
<div>
  <label className="label">Semester / Term *</label>
  <select
    className="input"
    value={selectedSemester}
    onChange={(e) => setSelectedSemester(e.target.value)}
    required
  >
    <option value="">Select Semester/Term</option>
    <option value="1st Semester">1st Semester</option>
    <option value="2nd Semester">2nd Semester</option>
    <option value="3rd Semester">3rd Semester</option>
    <option value="4th Semester">4th Semester</option>
    <option value="5th Semester">5th Semester</option>
    <option value="6th Semester">6th Semester</option>
    <option value="7th Semester">7th Semester</option>
    <option value="8th Semester">8th Semester</option>
    <option value="1st Term">1st Term</option>
    <option value="2nd Term">2nd Term</option>
    <option value="3rd Term">3rd Term</option>
    <option value="Annual">Annual</option>
    <option value="Final Term">Final Term</option>
    <option value="Mid Term">Mid Term</option>
  </select>
  <p className="text-xs text-gray-500 mt-1">Select semester or term as per your school system</p>
</div>

            <div>
              <label className="label">Semester</label>
              <select
                className="input"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                <option value="">Select Semester</option>
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
                <option value="3rd Semester">3rd Semester</option>
                <option value="4th Semester">4th Semester</option>
                <option value="5th Semester">5th Semester</option>
                <option value="6th Semester">6th Semester</option>
                <option value="7th Semester">7th Semester</option>
                <option value="8th Semester">8th Semester</option>
              </select>
            </div>

            <div>
              <label className="label">Exam Type</label>
              <select
                className="input"
                value={selectedExamType}
                onChange={(e) => setSelectedExamType(e.target.value)}
              >
                <option value="1st Term">1st Term Exam</option>
                <option value="2nd Term">2nd Term Exam</option>
                <option value="Final Term">Final Term Exam</option>
                <option value="Annual">Annual Exam</option>
              </select>
            </div>

            <div>
              <label className="label">Academic Year</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., 2024-2025"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Subjects & Marks</label>
              {subjects.map((subject, idx) => (
                <div key={idx} className="flex flex-wrap gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Code"
                    className="input w-20 text-sm"
                    value={subject.code}
                    onChange={(e) => updateSubject(idx, 'code', e.target.value.toUpperCase())}
                  />
                  <input
                    type="text"
                    placeholder="Subject Name"
                    className="input flex-1 min-w-[120px] text-sm"
                    value={subject.name}
                    onChange={(e) => updateSubject(idx, 'name', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Total"
                    className="input w-20 text-sm"
                    value={subject.totalMarks}
                    onChange={(e) => updateSubject(idx, 'totalMarks', parseInt(e.target.value))}
                  />
                  <input
                    type="number"
                    placeholder="Obtained"
                    className="input w-20 text-sm"
                    value={subject.obtainedMarks}
                    onChange={(e) => updateSubject(idx, 'obtainedMarks', parseInt(e.target.value))}
                  />
                  <button
                    onClick={() => removeSubject(idx)}
                    className="text-red-500 hover:text-red-700 px-2"
                    disabled={subjects.length === 1}
                  >
                    🗑️
                  </button>
                </div>
              ))}
              <button onClick={addSubject} className="btn-secondary text-sm mt-2">
                + Add Subject
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Student Selection */}
        <div className="p-6 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold mb-4">2. Select Students</h2>
          
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No students found</div>
          ) : (
            <>
              <div className="mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Select All ({filteredStudents.length} students)</span>
                </label>
              </div>
              
              <div className="max-h-96 overflow-y-auto border rounded-lg" style={{ borderColor: 'var(--border)' }}>
                {filteredStudents.map((student) => (
                  <div
                    key={student._id}
                    className="p-3 border-b flex items-center gap-3 cursor-pointer hover:bg-accent/5"
                    style={{ borderColor: 'var(--border)' }}
                    onClick={() => handleSelectStudent(student._id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student._id)}
                      onChange={() => {}}
                      className="w-4 h-4"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <div className="font-semibold">{student.name}</div>
                      <div className="text-xs text-gray-500">ID: {student.studentId} | {student.program}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                <div className="text-sm">
                  Selected: <strong>{selectedStudents.length}</strong> students
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Generate Button */}
      <div className="mt-6">
        <button
          onClick={generateDMCs}
          disabled={generating || selectedStudents.length === 0 || !selectedSemester}
          className="btn-primary w-full py-3 text-lg"
        >
          {generating ? 'Generating DMCs...' : `📜 Generate DMCs for ${selectedStudents.length} Students`}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="mt-6 p-6 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold mb-4">Generation Results</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-green-500/10 rounded-lg">
              <div className="text-2xl font-bold text-green-500">{results.generated}</div>
              <div className="text-sm">Generated</div>
            </div>
            <div className="text-center p-3 bg-red-500/10 rounded-lg">
              <div className="text-2xl font-bold text-red-500">{results.failed}</div>
              <div className="text-sm">Failed</div>
            </div>
            <div className="text-center p-3 bg-blue-500/10 rounded-lg">
              <div className="text-2xl font-bold text-blue-500">{results.total}</div>
              <div className="text-sm">Total</div>
            </div>
          </div>
          
          {results.results && results.results.length > 0 && (
            <div className="max-h-60 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0" style={{ background: 'var(--bg-card)' }}>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <th className="p-2 text-left">Student</th>
                    <th className="p-2 text-left">DMC ID</th>
                    <th className="p-2 text-center">Percentage</th>
                    <th className="p-2 text-center">Grade</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.results.map((r: any, i: number) => (
                    <tr key={i} className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <td className="p-2">{r.studentName}</td>
                      <td className="p-2 font-mono text-xs">{r.dmcId}</td>
                      <td className="p-2 text-center">{r.overallPercentage}%</td>
                      <td className="p-2 text-center font-bold" style={{ color: 'var(--accent)' }}>{r.overallGrade}</td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          r.overallStatus === 'Pass' 
                            ? 'bg-green-500/20 text-green-500' 
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {r.overallStatus}
                        </span>
                       </td>
                     </tr>
                  ))}
                </tbody>
               </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}