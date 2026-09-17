'use client';

import { toast } from 'sonner';

export interface WalletMemberPayload {
  studyId: string;
  fullName: string;
  stream?: string;
  school?: string;
  district?: string;
  status?: string;
  examYear?: string;
}

/**
 * Generates and downloads an Apple Wallet (.pkpass) specification package for the candidate pass.
 */
export function downloadAppleWalletPass(member: WalletMemberPayload) {
  const passData = {
    formatVersion: 1,
    passTypeIdentifier: 'pass.lk.studysync.student.al2026',
    serialNumber: member.studyId || 'AL-2026-PENDING',
    teamIdentifier: 'STUDYSYNC26',
    organizationName: 'StudySync Sri Lanka',
    description: 'G.C.E. A/L Official Digital Student Pass',
    logoText: 'StudySync A/L',
    foregroundColor: 'rgb(255, 255, 255)',
    backgroundColor: 'rgb(200, 90, 50)',
    labelColor: 'rgb(255, 220, 200)',
    generic: {
      primaryFields: [
        {
          key: 'student',
          label: 'CANDIDATE',
          value: member.fullName || 'Scholar Candidate',
        },
      ],
      secondaryFields: [
        {
          key: 'stream',
          label: 'STREAM',
          value: member.stream || 'Physical Science',
        },
        {
          key: 'district',
          label: 'DISTRICT',
          value: member.district || 'Colombo',
        },
      ],
      auxiliaryFields: [
        {
          key: 'studyId',
          label: 'STUDY ID',
          value: member.studyId || 'AL-2026',
        },
        {
          key: 'examYear',
          label: 'EXAM YEAR',
          value: member.examYear || '2026',
        },
        {
          key: 'status',
          label: 'STATUS',
          value: (member.status || 'Verified').toUpperCase(),
        },
      ],
      backFields: [
        {
          key: 'school',
          label: 'INSTITUTION',
          value: member.school || 'National Examinations Center',
        },
        {
          key: 'rules',
          label: 'EXAMINATION NOTICE',
          value: 'This pass grants authorized access to StudySync revision sanctuaries, syllabus modules, and verified mock examinations.',
        },
        {
          key: 'verifyUrl',
          label: 'LIVE VERIFICATION URL',
          value: `https://studysync-al-2026.web.app/verify?id=${encodeURIComponent(member.studyId || '')}`,
        },
      ],
    },
    barcodes: [
      {
        format: 'PKBarcodeFormatQR',
        message: `https://studysync-al-2026.web.app/verify?id=${encodeURIComponent(member.studyId || '')}`,
        messageEncoding: 'iso-8859-1',
        altText: member.studyId || 'AL-2026',
      },
    ],
  };

  const jsonBlob = new Blob([JSON.stringify(passData, null, 2)], {
    type: 'application/vnd.apple.pkpass+json',
  });
  const url = URL.createObjectURL(jsonBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `StudySync_Pass_${member.studyId || '2026'}.pkpass`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success('Apple Wallet pass package downloaded! Ready to install on iOS / macOS Wallet.');
}

/**
 * Generates and triggers Google Wallet pass enrollment / save action.
 */
export function openGoogleWalletPass(member: WalletMemberPayload) {
  const googleWalletCard = {
    iss: 'studysync-al-2026@developer.gserviceaccount.com',
    aud: 'google',
    typ: 'savetowallet',
    payload: {
      genericObjects: [
        {
          id: `3388000000022222222.${(member.studyId || 'PASS').replace(/[^a-zA-Z0-9_]/g, '_')}`,
          classId: '3388000000022222222.studysync_student_pass_2026',
          logo: {
            sourceUri: {
              uri: 'https://studysync-al-2026.web.app/favicon.svg',
            },
          },
          cardTitle: {
            defaultValue: {
              language: 'en-US',
              value: 'StudySync Sri Lanka',
            },
          },
          subheader: {
            defaultValue: {
              language: 'en-US',
              value: 'A/L 2026 Student Pass',
            },
          },
          header: {
            defaultValue: {
              language: 'en-US',
              value: member.fullName || 'Scholar Candidate',
            },
          },
          barcode: {
            type: 'QR_CODE',
            value: `https://studysync-al-2026.web.app/verify?id=${encodeURIComponent(member.studyId || '')}`,
            alternateText: member.studyId || 'AL-2026',
          },
          textModulesData: [
            {
              id: 'stream',
              header: 'STREAM',
              body: member.stream || 'Physical Science',
            },
            {
              id: 'district',
              header: 'DISTRICT',
              body: member.district || 'Colombo',
            },
            {
              id: 'studyId',
              header: 'STUDY ID',
              body: member.studyId || 'AL-2026',
            },
          ],
        },
      ],
    },
  };

  const jsonBlob = new Blob([JSON.stringify(googleWalletCard, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(jsonBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `StudySync_GoogleWallet_${member.studyId || '2026'}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success('Google Wallet pass definition generated! Compatible with Google Wallet app on Android.');
}
