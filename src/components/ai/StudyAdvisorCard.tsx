'use client';

import React from 'react';
import { CognitiveAdvisorCard } from '@/components/ai/CognitiveAdvisorCard';
import { AiStudyPrescription } from '@/types/testMarks';
import { CognitivePrescription } from '@/types/ai';

interface StudyAdvisorCardProps {
  prescriptions: (AiStudyPrescription | CognitivePrescription)[];
  streamName?: string;
}

export const StudyAdvisorCard: React.FC<StudyAdvisorCardProps> = ({
  prescriptions,
  streamName,
}) => {
  return <CognitiveAdvisorCard prescriptions={prescriptions} streamName={streamName} />;
};
