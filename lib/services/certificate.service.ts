import { CertificateRepository } from '../repositories/certificate.repository';
import { Result, ok, err } from '../core/result';

export interface LeavingCertificateData {
  id: string;
  studentId: string;
  studentName: string;
  fatherName: string;
  studentIdNo: string;
  program: string;
  leavingReason: string;
  lastAttendanceDate: Date;
  conduct: string;
  characterCertificate: string;
  nextAdmissionClass: string;
  remarks: string;
  certificateId: string;
  issueDate: Date;
  downloadCount: number;
}

export const CertificateService = {
  async generateLeavingCertificate(data: {
    studentId: string;
    studentName: string;
    fatherName?: string;
    studentIdNo?: string;
    program?: string;
    leavingReason: string;
    lastAttendanceDate?: Date;
    conduct?: string;
    characterCertificate?: string;
    nextAdmissionClass?: string;
    remarks?: string;
    certificateId?: string;
  }): Promise<Result<LeavingCertificateData>> {
    const certificateId = data.certificateId || `LC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const certificate = await CertificateRepository.create({
      studentId: data.studentId,
      studentName: data.studentName,
      fatherName: data.fatherName || '',
      studentIdNo: data.studentIdNo || '',
      program: data.program || '',
      leavingReason: data.leavingReason,
      lastAttendanceDate: data.lastAttendanceDate || new Date(),
      conduct: data.conduct || 'Good',
      characterCertificate: data.characterCertificate || 'Yes',
      nextAdmissionClass: data.nextAdmissionClass || '',
      remarks: data.remarks || '',
      certificateId,
      issueDate: new Date(),
    });

    return ok({
      id: certificate._id.toString(),
      studentId: certificate.studentId.toString(),
      studentName: certificate.studentName,
      fatherName: certificate.fatherName || '',
      studentIdNo: certificate.studentIdNo || '',
      program: certificate.program || '',
      leavingReason: certificate.leavingReason,
      lastAttendanceDate: certificate.lastAttendanceDate,
      conduct: certificate.conduct,
      characterCertificate: certificate.characterCertificate,
      nextAdmissionClass: certificate.nextAdmissionClass || '',
      remarks: certificate.remarks || '',
      certificateId: certificate.certificateId,
      issueDate: certificate.issueDate,
      downloadCount: certificate.downloadCount,
    });
  },

  async getCertificate(id: string): Promise<Result<LeavingCertificateData>> {
    const certificate = await CertificateRepository.findById(id);
    if (!certificate) {
      return err('Certificate not found');
    }

    await CertificateRepository.incrementDownloadCount(id);

    return ok({
      id: certificate._id.toString(),
      studentId: certificate.studentId.toString(),
      studentName: certificate.studentName,
      fatherName: certificate.fatherName || '',
      studentIdNo: certificate.studentIdNo || '',
      program: certificate.program || '',
      leavingReason: certificate.leavingReason,
      lastAttendanceDate: certificate.lastAttendanceDate,
      conduct: certificate.conduct,
      characterCertificate: certificate.characterCertificate,
      nextAdmissionClass: certificate.nextAdmissionClass || '',
      remarks: certificate.remarks || '',
      certificateId: certificate.certificateId,
      issueDate: certificate.issueDate,
      downloadCount: certificate.downloadCount,
    });
  },

  async getStudentCertificates(studentId: string): Promise<Result<LeavingCertificateData[]>> {
    const certificates = await CertificateRepository.findByStudentId(studentId);
    const mappedCertificates = certificates.map(cert => ({
      id: cert._id.toString(),
      studentId: cert.studentId.toString(),
      studentName: cert.studentName,
      fatherName: cert.fatherName || '',
      studentIdNo: cert.studentIdNo || '',
      program: cert.program || '',
      leavingReason: cert.leavingReason,
      lastAttendanceDate: cert.lastAttendanceDate,
      conduct: cert.conduct,
      characterCertificate: cert.characterCertificate,
      nextAdmissionClass: cert.nextAdmissionClass || '',
      remarks: cert.remarks || '',
      certificateId: cert.certificateId,
      issueDate: cert.issueDate,
      downloadCount: cert.downloadCount,
    }));
    return ok(mappedCertificates);
  },
};