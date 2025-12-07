
import React from 'react';

export interface Program {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<any>;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// Fix: Add and export the TranscriptMessage interface to resolve the import error in hooks/useLiveChat.ts.
export interface TranscriptMessage {
  id: number;
  role: 'user' | 'model' | 'system';
  text: string;
  isFinal: boolean;
}

export interface GroundingSource {
  web?: {
    uri: string;
    title: string;
  };
}

export interface GroundedResponse {
  text: string;
  sources: GroundingSource[];
}

export interface LabResultItem {
    testName: string;
    value: string;
    referenceRange: string;
    status: 'normal' | 'high' | 'low' | 'abnormal' | 'information';
    explanation: string;
}

export interface LabReportAnalysis {
    disclaimer: string;
    summary: string;
    results: LabResultItem[];
    recommendations: string;
    userQuestionAnswer: string;
}

// Fix: Add EcgFinding and EcgAnalysis interfaces to resolve errors in EcgAnalyzer.tsx.
export interface EcgFinding {
    parameter: string;
    value: string;
    finding: 'normal' | 'borderline' | 'abnormal' | 'unclear';
    explanation: string;
}

export interface EcgAnalysis {
    disclaimer: string;
    overallImpression: string;
    findings: EcgFinding[];
    recommendations: string;
    userQuestionAnswer: string;
}

export interface CvWorkExperience {
    jobTitle: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
}

export interface CvEducation {
    degree: string;
    institution: string;
    graduationDate: string;
}

export interface CvData {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
    summary: string;
    workExperience: CvWorkExperience[];
    education: CvEducation[];
    skills: string;
}

export interface Slide {
    title: string;
    content: string[];
    imagePrompt?: string;
    speakerNotes: string;
}

export interface Presentation {
    topic: string;
    slides: Slide[];
}
