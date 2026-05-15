'use client';

import { useState, useEffect } from 'react';
import { Course, Exam } from '@/lib/core/types';

export default function ExamListPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Final Term' as Exam['type'],
    semester: '',
    academicYear: new Date().getFullYear().toString(),
    program: '',
    startDate: '',
    endDate: '',
    courses: [] as string[],
  });

  useEffect(() => {
    fetchExams();
    fetchCourses();
    fetchPrograms();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/admin/exams');
      const data = await res.json();
      setExams(data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/admin/courses');
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      const uniquePrograms = [...new Set(data.filter((u: any) => u.role === 'student').map((s: any) => s.program).filter(Boolean))] as string[];
      setPrograms(uniquePrograms);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingExam ? `/api/admin/exams?id=${editingExam._id}` : '/api/admin/exams';
      const method = editingExam ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
        }),
      });
      
      if (res.ok) {
        setShowForm(false);
        setEditingExam(null);
        setFormData({
          name: '',
          type: 'Final Term',
          semester: '',
          academicYear: new Date().getFullYear().toString(),
          program: '',
          startDate: '',
          endDate: '',
          courses: [],
        });
        fetchExams();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      name: exam.name,
      type: exam.type,
      semester: exam.semester,
      academicYear: exam.academicYear,
      program: exam.program,
      startDate: exam.startDate.toString().split('T')[0],
      endDate: exam.endDate.toString().split('T')[0],
      courses: exam.courses,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this exam? This will also delete all marks for this exam.')) {
      await fetch(`/api/admin/exams?id=${id}`, { method: 'DELETE' });
      fetchExams();
    }
  };

  const updateExamStatus = async (id: string, status: Exam['status']) => {
    await fetch(`/api/admin/exams/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchExams();
  };

  const toggleCourseSelection = (courseId: string) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.includes(courseId)
        ? prev.courses.filter(id => id !== courseId)
        : [...prev.courses, courseId],
    }));
  };

  const getFilteredCourses = () => {
    if (!formData.program || !formData.semester) return [];
    return courses.filter(c => c.program === formData.program && c.semester === formData.semester);
  };

  const getStatusBadge = (status: Exam['status']) => {
    switch(status) {
      case 'upcoming': return <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-500">Upcoming</span>;
      case 'ongoing': return <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-500">Ongoing</span>;
      case 'completed': return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-500">Completed</span>;
      default: return <span className="px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-500">{status}</span>;
    }
  };

  if (loading) return <div className="text-center py-12">Loading exams...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>📅 Exam Management</h1>
        <button onClick={() => { setEditingExam(null); setFormData({ name: '', type: 'Final Term', semester: '', academicYear: new Date().getFullYear().toString(), program: '', startDate: '', endDate: '', courses: [] }); setShowForm(true); }} className="btn-primary">
          + Create Exam
        </button>
      </div>

      {/* Exams List */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                <th className="p-3">Exam Name</th>
                <th className="p-3">Program</th>
                <th className="p-3">Semester</th>
                <th className="p-3">Academic Year</th>
                <th className="p-3">Dates</th>
                <th className="p-3">Status</th>
                <th className="p-3">Courses</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam._id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-3 font-semibold">{exam.name}</td>
                  <td className="p-3">{exam.program}</td>
                  <td className="p-3">{exam.semester}</td>
                  <td className="p-3">{exam.academicYear}</td>
                  <td className="p-3 text-sm">
                    {new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}
                  </td>
                  <td className="p-3">{getStatusBadge(exam.status)}</td>
                  <td className="p-3 text-sm">{exam.courses.length} courses</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(exam)} className="text-blue-500 hover:text-blue-700" title="Edit">✏️</button>
                      {exam.status === 'upcoming' && (
                        <button onClick={() => updateExamStatus(exam._id!, 'ongoing')} className="text-yellow-500 hover:text-yellow-700" title="Start Exam">▶️</button>
                      )}
                      {exam.status === 'ongoing' && (
                        <button onClick={() => updateExamStatus(exam._id!, 'completed')} className="text-green-500 hover:text-green-700" title="Complete Exam">✅</button>
                      )}
                      <button onClick={() => handleDelete(exam._id!)} className="text-red-500 hover:text-red-700" title="Delete">🗑️</button>
                    </div>
                   </td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
        {exams.length === 0 && (
          <div className="text-center py-8 text-gray-500">No exams created yet</div>
        )}
      </div>

      {/* Create/Edit Exam Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--accent)' }}>
              {editingExam ? 'Edit Exam' : 'Create New Exam'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Exam Name *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Final Term Examination 2024"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Exam Type *</label>
                  <select
                    className="input"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Exam['type'] })}
                    required
                  >
                    <option value="1st Term">1st Term Exam</option>
                    <option value="2nd Term">2nd Term Exam</option>
                    <option value="Final Term">Final Term Exam</option>
                    <option value="Annual">Annual Exam</option>
                  </select>
                </div>
                <div>
                  <label className="label">Academic Year *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    placeholder="e.g., 2024-2025"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Program *</label>
                  <select
                    className="input"
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    required
                  >
                    <option value="">Select Program</option>
                    {programs.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                // Replace the semester select with:
<div>
  <label className="label">Semester / Term *</label>
  <select
    className="input"
    value={formData.semester}
    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Start Date *</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">End Date *</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              {formData.program && formData.semester && (
                <div>
                  <label className="label">Select Courses for this Exam *</label>
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
                    {getFilteredCourses().length === 0 ? (
                      <p className="text-sm text-gray-500">No courses found for this program and semester. Please add courses first.</p>
                    ) : (
                      getFilteredCourses().map(course => (
                        <label key={course._id} className="flex items-center gap-2 p-2 hover:bg-accent/5 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.courses.includes(course._id!)}
                            onChange={() => toggleCourseSelection(course._id!)}
                            className="w-4 h-4"
                          />
                          <span className="font-mono text-sm">{course.code}</span>
                          <span className="text-sm">{course.title}</span>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Selected: {formData.courses.length} courses</p>
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button type="submit" className="btn-primary flex-1">
                  {editingExam ? 'Update Exam' : 'Create Exam'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}