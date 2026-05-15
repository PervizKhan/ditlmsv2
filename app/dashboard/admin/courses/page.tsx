'use client';

import { useState, useEffect } from 'react';

interface Course {
  _id: string;
  code: string;
  title: string;
  credits: number;
  program: string;
  semester: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<string[]>([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    credits: 3,
    program: '',
    semester: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
    fetchPrograms();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/admin/courses');
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      const uniquePrograms = [...new Set(data.filter((u: any) => u.role === 'student').map((s: any) => s.program).filter(Boolean))] as string[];
      setPrograms(uniquePrograms);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCourse ? `/api/admin/courses?id=${editingCourse._id}` : '/api/admin/courses';
      const method = editingCourse ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        setShowForm(false);
        setEditingCourse(null);
        setFormData({ code: '', title: '', credits: 3, program: '', semester: '' });
        fetchCourses();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      title: course.title,
      credits: course.credits,
      program: course.program,
      semester: course.semester,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this course?')) {
      await fetch(`/api/admin/courses?id=${id}`, { method: 'DELETE' });
      fetchCourses();
    }
  };

  const filteredCourses = selectedProgram ? courses.filter(c => c.program === selectedProgram) : courses;

  if (loading) return <div className="text-center py-12">Loading courses...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>📚 Course Management</h1>
        <button onClick={() => { setEditingCourse(null); setFormData({ code: '', title: '', credits: 3, program: '', semester: '' }); setShowForm(true); }} className="btn-primary">
          + Add Course
        </button>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          className="input w-64"
          value={selectedProgram}
          onChange={(e) => setSelectedProgram(e.target.value)}
        >
          <option value="">All Programs</option>
          {programs.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Courses Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                <th className="p-3">Code</th>
                <th className="p-3">Title</th>
                <th className="p-3">Credits</th>
                <th className="p-3">Program</th>
                <th className="p-3">Semester</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course._id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-3 font-mono">{course.code}</td>
                  <td className="p-3">{course.title}</td>
                  <td className="p-3 text-center">{course.credits}</td>
                  <td className="p-3">{course.program}</td>
                  <td className="p-3">{course.semester}</td>
                  <td className="p-3">
                    <button onClick={() => handleEdit(course)} className="text-blue-500 mr-3">Edit</button>
                    <button onClick={() => handleDelete(course._id)} className="text-red-500">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-xl p-6 w-full max-w-md" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--accent)' }}>
              {editingCourse ? 'Edit Course' : 'Add Course'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Course Code*"
                className="input"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
              />
              <input
                type="text"
                placeholder="Course Title*"
                className="input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Credits*"
                className="input"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                required
              />
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
              <select
                className="input"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                required
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
              <div className="flex gap-3 pt-3">
                <button type="submit" className="btn-primary flex-1">Save</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}