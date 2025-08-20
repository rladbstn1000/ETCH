export interface CoverLetterRequest {
  name: string;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
  answer5: string;
}

export interface CoverLetterDetailResponse {
  id: number;
  name: string;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
  answer5: string;
}

export interface CoverLetterListResponse {
  id: number;
  name: string;
}

import type { QuestionCardProps } from "../../components/atoms/card";

export const getStandardQuestions = (
  answers: string[],
  onAnswerChange: (index: number, answer: string) => void
): QuestionCardProps[] => [
  {
    type: "question" as const,
    questionNumber: 1,
    questionTitle: "지원 동기 및 입사 후 포부",
    structure: "기업에 대한 관심과 지원 동기를 명확히 작성하세요.",
    tips: "구체적인 경험과 목표를 포함하세요.",
    keywords: "동기, 포부, 목표, 비전",
    answer: answers[0] || "",
    onAnswerChange: (answer: string) => onAnswerChange(0, answer),
  },
  {
    type: "question" as const,
    questionNumber: 2,
    questionTitle: "성격의 장단점 및 보완 방법",
    structure: "장점은 구체적 사례와 함께, 단점은 보완 노력과 함께 작성하세요.",
    tips: "업무와 연관된 장단점을 선택하세요.",
    keywords: "성격, 장점, 단점, 보완",
    answer: answers[1] || "",
    onAnswerChange: (answer: string) => onAnswerChange(1, answer),
  },
  {
    type: "question" as const,
    questionNumber: 3,
    questionTitle: "전공 및 특기사항",
    structure: "전공 지식과 특기를 업무와 연관지어 작성하세요.",
    tips: "실제 프로젝트나 경험을 포함하세요.",
    keywords: "전공, 특기, 역량, 기술",
    answer: answers[2] || "",
    onAnswerChange: (answer: string) => onAnswerChange(2, answer),
  },
  {
    type: "question" as const,
    questionNumber: 4,
    questionTitle: "경험 및 성취 사례",
    structure: "구체적인 경험과 그를 통해 얻은 성취를 작성하세요.",
    tips: "수치나 결과로 성과를 보여주세요.",
    keywords: "경험, 성취, 결과, 성과",
    answer: answers[3] || "",
    onAnswerChange: (answer: string) => onAnswerChange(3, answer),
  },
  {
    type: "question" as const,
    questionNumber: 5,
    questionTitle: "기타 사항",
    structure: "추가로 어필하고 싶은 내용을 자유롭게 작성하세요.",
    tips: "차별화된 강점이나 특별한 경험을 포함하세요.",
    keywords: "기타, 특별함, 차별화, 강점",
    answer: answers[4] || "",
    onAnswerChange: (answer: string) => onAnswerChange(4, answer),
  },
];

export const COVER_LETTER_QUESTIONS_STATIC = [
  {
    questionNumber: 1,
    questionTitle: "지원 동기 및 입사 후 포부",
    structure: "기업에 대한 관심과 지원 동기를 명확히 작성하세요.",
    tips: "구체적인 경험과 목표를 포함하세요.",
    keywords: "동기, 포부, 목표, 비전",
  },
  {
    questionNumber: 2,
    questionTitle: "성격의 장단점 및 보완 방법",
    structure: "장점은 구체적 사례와 함께, 단점은 보완 노력과 함께 작성하세요.",
    tips: "업무와 연관된 장단점을 선택하세요.",
    keywords: "성격, 장점, 단점, 보완",
  },
  {
    questionNumber: 3,
    questionTitle: "전공 및 특기사항",
    structure: "전공 지식과 특기를 업무와 연관지어 작성하세요.",
    tips: "실제 프로젝트나 경험을 포함하세요.",
    keywords: "전공, 특기, 역량, 기술",
  },
  {
    questionNumber: 4,
    questionTitle: "경험 및 성취 사례",
    structure: "구체적인 경험과 그를 통해 얻은 성취를 작성하세요.",
    tips: "수치나 결과로 성과를 보여주세요.",
    keywords: "경험, 성취, 결과, 성과",
  },
  {
    questionNumber: 5,
    questionTitle: "기타 사항",
    structure: "추가로 어필하고 싶은 내용을 자유롭게 작성하세요.",
    tips: "차별화된 강점이나 특별한 경험을 포함하세요.",
    keywords: "기타, 특별함, 차별화, 강점",
  },
];
