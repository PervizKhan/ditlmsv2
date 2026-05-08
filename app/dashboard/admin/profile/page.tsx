// app/dashboard/admin/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Student {
  _id: string;
  name: string;
  email: string;
  studentId?: string;
  fatherName?: string;
  cnic?: string;
  address?: string;
  profilePicture?: string;
  phone?: string;
  program?: string;
  dateOfBirth?: string;
  gender?: string;
  cgpa?: number;
  totalCredits?: number;
  enrollmentYear?: number;
  isVerified: boolean;
}

export default function AdminProfilePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('userId');
  
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Fetch all students on page load
  useEffect(() => {
    fetchStudents();
  }, []);

  // Fetch specific student when userId is selected
  useEffect(() => {
    if (userId) {
      fetchStudentProfile(userId);
    } else {
      setSelectedStudent(null);
    }
  }, [userId]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      // Filter only students
      const studentList = data.filter((u: any) => u.role === 'student');
      setStudents(studentList);
    } catch (error) {
      console.error('Error fetching students:', error);
      setMessage({ type: 'error', text: 'Failed to load students' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentProfile = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/profile?userId=${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setSelectedStudent(data.user);
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id) {
      router.push(`/dashboard/admin/profile?userId=${id}`);
    } else {
      router.push('/dashboard/admin/profile');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSelectedStudent(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/admin/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedStudent._id, ...selectedStudent })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Refresh the students list
        fetchStudents();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedStudent) return;
    
    setUploading(true);
    setMessage(null);
    
    const formData = new FormData();
    formData.append('profilePicture', file);
    formData.append('userId', selectedStudent._id);
    
    try {
      const response = await fetch('/api/upload/profile-picture', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSelectedStudent(prev => prev ? { ...prev, profilePicture: data.profilePicture } : null);
        setMessage({ type: 'success', text: 'Profile picture uploaded!' });
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  if (loading && !selectedStudent) {
    return <div className="text-center py-8">Loading students...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
          Student Profiles
        </h1>
        <p className="opacity-70 mt-1">Manage student information and profiles</p>
      </div>

      {/* Student Selection Dropdown */}
      <div className="card">
        <label className="label">Select Student</label>
        <select
          value={userId || ''}
          onChange={handleStudentSelect}
          className="input"
        >
          <option value="">-- Select a student --</option>
          {students.map((student) => (
            <option key={student._id} value={student._id}>
              {student.name} - {student.email}
            </option>
          ))}
        </select>
      </div>

      {message && (
        <div className={message.type === 'success' ? 'alert-success' : 'alert-error'}>
          {message.text}
        </div>
      )}

      {selectedStudent ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Section */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Profile Picture</h2>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {selectedStudent.profilePicture ? (
                  <img 
                    src={selectedStudent.profilePicture} 
                    alt={selectedStudent.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">👤</span>
                )}
              </div>
              <div>
                <label className="btn-secondary cursor-pointer inline-block">
                  {uploading ? 'Uploading...' : 'Upload Picture'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <p className="text-xs opacity-60 mt-2">JPEG, PNG, WEBP (Max 2MB)</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={selectedStudent.name}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Father's Name</label>
                <input
                  type="text"
                  name="fatherName"
                  value={selectedStudent.fatherName || ''}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Enter father's name"
                />
              </div>
              <div>
                <label className="label">Student ID</label>
                <input
                  type="text"
                  name="studentId"
                  value={selectedStudent.studentId || ''}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="e.g., BC190200651"
                />
              </div>
              <div>
                <label className="label">CNIC Number</label>
                <input
                  type="text"
                  name="cnic"
                  value={selectedStudent.cnic || ''}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="e.g., 12345-1234567-1"
                />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={selectedStudent.phone || ''}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="e.g., 0300 1234567"
                />
              </div>
              <div>
                <label className="label">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={selectedStudent.dateOfBirth || ''}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Gender</label>
                <select
                  name="gender"
                  value={selectedStudent.gender || 'male'}
                  onChange={handleInputChange}
                  className="input"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Program</label>
                <input
                  type="text"
                  name="program"
                  value={selectedStudent.program || ''}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="e.g., BS Computer Science"
                />
              </div>
              <div>
                <label className="label">Enrollment Year</label>
                <input
                  type="number"
                  name="enrollmentYear"
                  value={selectedStudent.enrollmentYear || ''}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="e.g., 2020"
                  min="2000"
                  max="2030"
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Academic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">CGPA</label>
                <input
                  type="number"
                  name="cgpa"
                  value={selectedStudent.cgpa || ''}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="e.g., 3.65"
                  step="0.01"
                  min="0"
                  max="4"
                />
              </div>
              <div>
                <label className="label">Total Credits Earned</label>
                <input
                  type="number"
                  name="totalCredits"
                  value={selectedStudent.totalCredits || ''}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="e.g., 72"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Address Information</h2>
            <div>
              <label className="label">Address</label>
              <textarea
                name="address"
                value={selectedStudent.address || ''}
                onChange={handleInputChange}
                className="input"
                rows={3}
                placeholder="Enter complete address"
              />
            </div>
          </div>

          {/* Account Information (Read-only) */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Account Information</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  value={selectedStudent.email}
                  className="input bg-gray-100"
                  style={{ background: 'var(--surface)', opacity: 0.7 }}
                  disabled
                />
                <p className="text-xs opacity-60 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="label">Verification Status</label>
                <input
                  type="text"
                  value={selectedStudent.isVerified ? 'Verified ✓' : 'Not Verified ✗'}
                  className="input bg-gray-100"
                  style={{ background: 'var(--surface)', opacity: 0.7 }}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
            <button type="button" onClick={() => router.push('/dashboard/admin')} className="btn-secondary">
              Back to Users
            </button>
          </div>
        </form>
      ) : (
        <div className="card text-center py-8">
          <p className="opacity-70">Select a student from the dropdown above to edit their profile.</p>
        </div>
      )}
    </div>
  );
}