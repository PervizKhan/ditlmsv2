// app/dashboard/admin/transcript/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Student {
  _id: string;
  name: string;
  email: string;
}

interface Course {
  code: string;
  title: string;
  credits: number;
  grade: string;
  gp: number;
  semester: string;
  semesterCode: string;
  year: number;
}

export default function ManageTranscriptPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newCourse, setNewCourse] = useState<Course>({
    code: '',
    title: '',
    credits: 3,
    grade: 'B',
    gp: 3.00,
    semester: '',
    semesterCode: '',
    year: new Date().getFullYear()
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      const studentList = data.filter((u: any) => u.role === 'student');
      setStudents(studentList);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentTranscript = async (studentId: string) => {
    try {
      const response = await fetch(`/api/admin/transcript/${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching transcript:', error);
    }
  };

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudent(studentId);
    fetchStudentTranscript(studentId);
  };

  const addCourse = async () => {
    if (!selectedStudent) return;
    
    try {
      const response = await fetch('/api/admin/transcript/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent,
          course: newCourse
        })
      });
      
      if (response.ok) {
        alert('Course added successfully!');
        setShowForm(false);
        fetchStudentTranscript(selectedStudent);
        setNewCourse({
          code: '',
          title: '',
          credits: 3,
          grade: 'B',
          gp: 3.00,
          semester: '',
          semesterCode: '',
          year: new Date().getFullYear()
        });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add course');
      }
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Failed to add course');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading students...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg md:text-xl font-semibold mb-4" style={{ color: 'var(--accent)' }}>
          Manage Student Transcripts
        </h2>
        
        {/* Student Selection */}
        <div className="mb-6">
          <label className="label">Select Student</label>
          <select
            value={selectedStudent}
            onChange={(e) => handleStudentSelect(e.target.value)}
            className="input max-w-md"
          >
            <option value="">-- Select a student --</option>
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.name} - {student.email}
              </option>
            ))}
          </select>
        </div>

        {selectedStudent && (
          <>
            {/* Add Course Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h3 className="text-base md:text-lg font-semibold">Courses</h3>
              <button
                onClick={() => setShowForm(!showForm)}
                className="btn-primary text-sm px-4 py-2"
              >
                {showForm ? 'Cancel' : '+ Add Course'}
              </button>
            </div>

            {/* Add Course Form - Better spacing */}
            {showForm && (
              <div className="card mb-6 p-4 md:p-5" style={{ background: 'var(--surface)' }}>
                <h3 className="font-semibold mb-3 text-base">Add New Course</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <input
                    type="text"
                    placeholder="Course Code (e.g., CS101)"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value.toUpperCase() })}
                    className="input text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Course Title"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    className="input text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Credits"
                    value={newCourse.credits}
                    onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) })}
                    className="input text-sm"
                  />
                  <select
                    value={newCourse.grade}
                    onChange={(e) => {
                      const grade = e.target.value;
                      const gpMap: { [key: string]: number } = {
                        'A': 4.00, 'A-': 3.70, 'B+': 3.30, 'B': 3.00,
                        'B-': 2.70, 'C+': 2.30, 'C': 2.00, 'D': 1.00, 'F': 0.00
                      };
                      setNewCourse({ ...newCourse, grade, gp: gpMap[grade] });
                    }}
                    className="input text-sm"
                  >
                    <option value="A">A (4.00)</option>
                    <option value="A-">A- (3.70)</option>
                    <option value="B+">B+ (3.30)</option>
                    <option value="B">B (3.00)</option>
                    <option value="B-">B- (2.70)</option>
                    <option value="C+">C+ (2.30)</option>
                    <option value="C">C (2.00)</option>
                    <option value="D">D (1.00)</option>
                    <option value="F">F (0.00)</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Semester (e.g., Fall 2024)"
                    value={newCourse.semester}
                    onChange={(e) => setNewCourse({ ...newCourse, semester: e.target.value })}
                    className="input text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Semester Code (e.g., FA24)"
                    value={newCourse.semesterCode}
                    onChange={(e) => setNewCourse({ ...newCourse, semesterCode: e.target.value.toUpperCase() })}
                    className="input text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Year"
                    value={newCourse.year}
                    onChange={(e) => setNewCourse({ ...newCourse, year: parseInt(e.target.value) })}
                    className="input text-sm"
                  />
                </div>
                <button onClick={addCourse} className="btn-primary mt-4 w-full sm:w-auto px-6 py-2">
                  Add Course
                </button>
              </div>
            )}

            {/* Courses List - Mobile Cards */}
            {courses.length === 0 ? (
              <div className="text-center py-8 opacity-70">
                No courses found. Click "Add Course" to add transcript data.
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map((course, idx) => (
                  <div key={idx} className="card p-3 md:p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                      <div>
                        <span className="font-mono text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                          {course.code}
                        </span>
                        <h4 className="font-medium text-sm md:text-base mt-1">{course.title}</h4>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-xs px-2 py-1 rounded" style={{ background: 'var(--bg)' }}>
                          {course.credits} credits
                        </span>
                        <span className="text-sm font-bold px-2 py-1 rounded" style={{ background: 'var(--accent)', color: '#0b1f3a' }}>
                          {course.grade}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs opacity-70 md:flex md:gap-4">
                      <span>📖 {course.semester}</span>
                      <span>📅 {course.year}</span>
                      <span>🎯 GPA: {course.gp.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}