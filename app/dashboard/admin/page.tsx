'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Student {
  _id: string;
  id: string;
  name: string;
  email: string;
  studentId: string;
  program: string;
  fatherName: string;
  phone?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      console.log('API Response:', data);
      
      // Filter only students
      const studentList = data.filter((user: any) => user.role === 'student');
      
      setStudents(studentList);
      
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading students...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="alert-error">Error: {error}</div>
        <button onClick={fetchStudents} className="btn-primary mt-4">Retry</button>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">No students found.</div>
        <Link href="/dashboard/admin/bulk-import" className="btn-primary mt-4 inline-block">
          Import Students
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>Student Management</h1>
        <Link href="/dashboard/admin/bulk-import" className="btn-primary">
          + Import Students
        </Link>
      </div>

      {/* Student Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                <th className="p-3">Student ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Father's Name</th>
                <th className="p-3">Program</th>
                <th className="p-3">Email</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id || student.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-3">{student.studentId || 'N/A'}</td>
                  <td className="p-3 font-medium">{student.name}</td>
                  <td className="p-3">{student.fatherName || 'N/A'}</td>
                  <td className="p-3">{student.program || 'N/A'}</td>
                  <td className="p-3">{student.email}</td>
                  <td className="p-3">
                    <Link 
                      href={`/dashboard/admin/profile?userId=${student._id || student.id}`}
                      className="text-blue-500 hover:text-blue-700 mr-3"
                    >
                      Edit
                    </Link>
                    <button className="text-red-500 hover:text-red-700">
                      Delete
                    </button>
                   </td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}