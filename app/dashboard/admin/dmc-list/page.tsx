'use client';

import { useState, useEffect } from 'react';

interface DMC {
  _id: string;
  studentName: string;
  studentIdNo: string;
  program: string;
  semester: string;
  examType: string;
  academicYear: string;
  overallPercentage: number;
  overallGrade: string;
  overallStatus: string;
  dmcId: string;
  issueDate: string;
}

export default function DMCListPage() {
  const [dmcs, setDmcs] = useState<DMC[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgram, setFilterProgram] = useState('');
  const [programs, setPrograms] = useState<string[]>([]);

  useEffect(() => {
    fetchDMCs();
    fetchPrograms();
  }, []);

  const fetchDMCs = async () => {
    try {
      const res = await fetch('/api/admin/dmc/list');
      const data = await res.json();
      setDmcs(data);
    } catch (error) {
      console.error('Error fetching DMCs:', error);
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
      console.error('Error fetching programs:', error);
    }
  };

  const filteredDMCs = dmcs.filter(dmc => {
    const matchesSearch = dmc.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          dmc.studentIdNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          dmc.dmcId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProgram = !filterProgram || dmc.program === filterProgram;
    return matchesSearch && matchesProgram;
  });

  const viewDMC = (dmcId: string) => {
    window.open(`/dmc/${dmcId}`, '_blank');
  };

  const getGradeColor = (grade: string) => {
    switch(grade) {
      case 'A+': return 'text-yellow-500';
      case 'A': return 'text-green-500';
      case 'B': return 'text-blue-500';
      case 'C': return 'text-gray-500';
      case 'F': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) return <div className="text-center py-12">Loading DMCs...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>📜 Generated DMCs</h1>
        <button onClick={fetchDMCs} className="btn-secondary">
          🔄 Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="🔍 Search by name, ID or DMC number..."
            className="input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-48">
          <select
            className="input"
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
          >
            <option value="">All Programs</option>
            {programs.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* DMCs Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                <th className="p-3">DMC No.</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">ID</th>
                <th className="p-3">Program</th>
                <th className="p-3">Semester</th>
                <th className="p-3">Exam</th>
                <th className="p-3">Percentage</th>
                <th className="p-3">Grade</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDMCs.map((dmc) => (
                <tr key={dmc._id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-3 font-mono text-sm">{dmc.dmcId}</td>
                  <td className="p-3 font-semibold">{dmc.studentName}</td>
                  <td className="p-3">{dmc.studentIdNo}</td>
                  <td className="p-3">{dmc.program}</td>
                  <td className="p-3">{dmc.semester}</td>
                  <td className="p-3">{dmc.examType}</td>
                  <td className="p-3">{dmc.overallPercentage}%</td>
                  <td className="p-3">
                    <span className={`font-bold ${getGradeColor(dmc.overallGrade)}`}>
                      {dmc.overallGrade}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      dmc.overallStatus === 'Pass' 
                        ? 'bg-green-500/20 text-green-500' 
                        : 'bg-red-500/20 text-red-500'
                    }`}>
                      {dmc.overallStatus}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => viewDMC(dmc.dmcId)}
                      className="btn-secondary text-sm px-3 py-1"
                    >
                      👁️ View / Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredDMCs.length === 0 && (
          <div className="text-center py-8 text-gray-500">No DMCs found. Generate DMCs first.</div>
        )}
      </div>
    </div>
  );
}