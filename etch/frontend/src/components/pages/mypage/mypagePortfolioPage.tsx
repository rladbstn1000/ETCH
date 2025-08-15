import { useState } from "react";
import { useNavigate } from "react-router";
import {
  PortfolioWriteStackData,
  type PortfolioStackEnum,
} from "../../../types/portfolio/portfolioStack";
import {
  PortfolioState,
  type portfolioDatas,
  type education,
  type language,
} from "../../../types/portfolio/portfolioDatas";
import PortfolioWriteInput from "../../organisms/portfolio/portfolioWriteInput";
import PortfolioSubmitButton from "../../organisms/portfolio/portfolioSubmitButton";
import PortfolioStackSelect from "../../organisms/portfolio/portfolioStackSelect";
import type { ProjectCategoryEnum } from "../../../types/project/projectCategroyData";
import PortfolioWriteTextCard from "../../organisms/portfolio/portfolioTextCard";
import PortfolioProjectPage from "./portfolioProjectPage";
import {
  convertPortfolioDataToRequest,
  createPortfolio,
  // createProject,
} from "../../../api/portfolioApi";
import { createProject } from "../../../api/projectApi";
import type { ProjectInfo } from "./mypagePortfolioDetail";

// 프로젝트 데이터 타입 정의
interface ProjectData {
  title: string;
  content: string;
  projectCategory: ProjectCategoryEnum | "";
  githubUrl: string;
  youtubeUrl: string;
  isPublic: boolean;
  projectTechs: number[];
  files: File[];
  thumbnailFile: File | null;
}

// 초기 프로젝트 상태
const initialProjectData: ProjectData = {
  title: "",
  content: "",
  projectCategory: "",
  githubUrl: "",
  youtubeUrl: "",
  isPublic: true,
  projectTechs: [],
  files: [],
  thumbnailFile: null,
};

function MypagePortfolioPage() {
  const navigate = useNavigate();
  const [portfolioData, setPortfolioData] = useState<portfolioDatas>({
    ...PortfolioState,
    stack: [] as PortfolioStackEnum[],
  });

  // 프로젝트 관련 상태들
  const [showProjectSection, setShowProjectSection] = useState(false);
  const [projectData, setProjectData] =
    useState<ProjectData>(initialProjectData);
  const [registeredProjects, setRegisteredProjects] = useState<ProjectData[]>(
    []
  );

  // 교육/활동과 자격증 폼 토글 상태들
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [showLanguageForm, setShowLanguageForm] = useState(false);

  // 제출 상태 관리 (추가)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============== 파싱 함수들 (화면 표시용만) ==============

  // 문자열을 배열로 파싱 (화면 표시용)
  const parseEducationData = (educationString: string): education[] => {
    if (!educationString) return [];

    const educationItems = educationString
      .split("|")
      .filter((item) => item.trim());
    return educationItems.map((item) => {
      const [companyName, active, startAt, endAt] = item.split("^");
      return {
        companyName: companyName || "",
        active: active || "",
        startAt: startAt || "",
        endAt: endAt || "",
      };
    });
  };

  const parseLanguageData = (languageString: string): language[] => {
    if (!languageString) return [];

    const languageItems = languageString
      .split("|")
      .filter((item) => item.trim());
    return languageItems.map((item) => {
      const [licenseName, getAt, issuer] = item.split("^");
      return {
        licenseName: licenseName || "",
        getAt: getAt || "",
        issuer: issuer || "",
      };
    });
  };

  // 배열을 문자열로 변환 (삭제 기능용만)
  const arrayToEducationString = (educations: education[]): string => {
    return educations
      .map(
        (edu) => `${edu.companyName}^${edu.active}^${edu.startAt}^${edu.endAt}`
      )
      .join("|");
  };

  const arrayToLanguageString = (languages: language[]): string => {
    return languages
      .map((lang) => `${lang.licenseName}^${lang.getAt}^${lang.issuer}`)
      .join("|");
  };

  // ============== 기본 정보 핸들러들 ==============

  const handleStacksChange = (stack: PortfolioStackEnum) => {
    setPortfolioData((prev) => {
      const currentStacks = prev.stack;
      const isSelected = currentStacks.includes(stack);

      let newStacks;
      if (isSelected) {
        newStacks = currentStacks.filter((s) => s !== stack);
      } else {
        newStacks = [...currentStacks, stack];
      }

      console.log("현재 스택들 : ", newStacks);

      return {
        ...prev,
        stack: newStacks,
      };
    });
  };

  const handleNameChange = (value: string) => {
    setPortfolioData((prev) => ({
      ...prev,
      name: value,
    }));
  };

  const handlePhoneNumberChange = (value: string) => {
    setPortfolioData((prev) => ({
      ...prev,
      phoneNumber: value,
    }));
  };

  const handleEmailChange = (value: string) => {
    setPortfolioData((prev) => ({
      ...prev,
      email: value,
    }));
  };

  const handleGithubUrlChange = (value: string) => {
    setPortfolioData((prev) => ({
      ...prev,
      githubUrl: value,
    }));
  };

  const handleBlogUrlChange = (value: string) => {
    setPortfolioData((prev) => ({
      ...prev,
      blogUrl: value, // 블로그 URL 핸들러 추가
    }));
  };

  const handleIntroChange = (value: string) => {
    setPortfolioData((prev) => ({
      ...prev,
      introduce: value,
    }));
  };

  // ============== 프로젝트 관련 핸들러들 ==============

  const handleProjectDataChange = (newProjectData: Partial<ProjectData>) => {
    setProjectData((prev) => ({
      ...prev,
      ...newProjectData,
    }));
  };

  const handleRegisterProject = () => {
    // 프로젝트 유효성 검사
    if (!projectData.title.trim()) {
      alert("프로젝트 제목을 입력해주세요.");
      return;
    }

    if (!projectData.content.trim()) {
      alert("프로젝트 설명을 입력해주세요.");
      return;
    }

    if (!projectData.projectCategory) {
      alert("프로젝트 카테고리를 선택해주세요.");
      return;
    }

    // 등록된 프로젝트 목록에 추가
    setRegisteredProjects((prev) => [...prev, { ...projectData }]);

    // 프로젝트 데이터 초기화
    setProjectData(initialProjectData);

    // 프로젝트 섹션 숨기기
    setShowProjectSection(false);

    alert("프로젝트가 임시 등록되었습니다!");
  };

  const handleRemoveProject = (index: number) => {
    setRegisteredProjects((prev) => prev.filter((_, i) => i !== index));
  };

  // ============== 교육/자격증 관련 핸들러들 ==============

  const handleActivityAdd = (educationString: string) => {
    // 기존 문자열에 새 항목 추가
    const newEducationString = portfolioData.education
      ? `${portfolioData.education}|${educationString}`
      : educationString;

    setPortfolioData((prev) => ({
      ...prev,
      education: newEducationString,
    }));

    // 폼 닫기
    setShowEducationForm(false);
    console.log("교육/활동 추가됨:", educationString);
  };

  const handleLicenseAdd = (languageString: string) => {
    // 기존 문자열에 새 항목 추가
    const newLanguageString = portfolioData.language
      ? `${portfolioData.language}|${languageString}`
      : languageString;

    setPortfolioData((prev) => ({
      ...prev,
      language: newLanguageString,
    }));

    // 폼 닫기
    setShowLanguageForm(false);
    console.log("자격증 추가됨:", languageString);
  };

  const handleEducationRemove = (index: number) => {
    // 파싱 → 삭제 → 다시 문자열 변환
    const parsedEducations = parseEducationData(portfolioData.education);
    const filteredEducations = parsedEducations.filter((_, i) => i !== index);
    const newEducationString = arrayToEducationString(filteredEducations);

    setPortfolioData((prev) => ({
      ...prev,
      education: newEducationString,
    }));
    console.log("교육/활동 삭제됨, 인덱스:", index);
  };

  const handleLanguageRemove = (index: number) => {
    // 파싱 → 삭제 → 다시 문자열 변환
    const parsedLanguages = parseLanguageData(portfolioData.language);
    const filteredLanguages = parsedLanguages.filter((_, i) => i !== index);
    const newLanguageString = arrayToLanguageString(filteredLanguages);

    setPortfolioData((prev) => ({
      ...prev,
      language: newLanguageString,
    }));
    console.log("자격증 삭제됨, 인덱스:", index);
  };

  // ============== 수정된 제출 핸들러 ==============
  const handleSubmit = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      if (!portfolioData.name?.trim()) {
        alert("이름을 입력해주세요.");
        return;
      }

      if (!portfolioData.phoneNumber?.trim()) {
        alert("연락처를 입력해주세요.");
        return;
      }

      if (!portfolioData.introduce?.trim()) {
        alert("자기소개를 입력해주세요.");
        return;
      }

      console.log("=== 제출 시작 ===");
      console.log("제출할 포트폴리오 데이터:", portfolioData);
      console.log("제출할 프로젝트 데이터:", registeredProjects);

      // 1. 등록된 프로젝트 생성 및 ID 수집
      const createdProjectIds: ProjectInfo[] = [];

      for (const project of registeredProjects) {
        try {
          const projectInput = {
            title: project.title,
            content: project.content,
            projectCategory: project.projectCategory as ProjectCategoryEnum,
            techCodeIds: project.projectTechs,
            githubUrl: project.githubUrl,
            youtubeUrl: project.youtubeUrl,
            isPublic: project.isPublic,
            thumbnailFile: project.thumbnailFile || undefined,
            imageFiles: project.files.filter((file) =>
              file.type.startsWith("image/")
            ),
          };

          console.log(`프로젝트 "${project.title}" 생성 중...`);
          const createdProject = await createProject(projectInput);
          createdProjectIds.push(createdProject);
          console.log(
            `프로젝트 "${project.title}" 생성 완료, ID: ${createdProject}`
          );
        } catch (projectError) {
          console.error(`프로젝트 "${project.title}" 생성 실패:`, projectError);
          alert(
            `프로젝트 "${project.title}" 등록에 실패했습니다. 계속 진행합니다.`
          );
        }
      }

      console.log("생성된 프로젝트 ID들:", createdProjectIds);

      // 2. portfolioData를 API 형식으로 변환
      const requestData = convertPortfolioDataToRequest(
        portfolioData,
        createdProjectIds
      );

      // 3. language와 education을 문자열로 변환
      if (portfolioData.language && Array.isArray(portfolioData.language)) {
        requestData.language = portfolioData.language
          .map((lang) => [lang.name, lang.getAt, lang.issuer].join("^"))
          .join("#");
      }

      if (portfolioData.education && Array.isArray(portfolioData.education)) {
        requestData.education = portfolioData.education
          .map((edu) => [edu.school, edu.graduationAt, edu.major].join("^"))
          .join("#");
      }

      console.log("API 전송용 포트폴리오 데이터:", requestData);

      // 4. 포트폴리오 생성 API 호출
      const portfolioResponse = await createPortfolio(requestData);
      console.log("포트폴리오 생성 성공:", portfolioResponse);

      alert(
        `포트폴리오가 성공적으로 등록되었습니다!\n-  등록된 프로젝트 수: ${createdProjectIds.length}개`
      );

      navigate("/mypage");
    } catch (error) {
      console.error("=== 포트폴리오 등록 실패 ===", error);

      let errorMessage = "포트폴리오 등록 중 오류가 발생했습니다.";
      const err = error as {
        response?: { data?: { message?: string }; status?: number };
      };

      if (err.response?.data?.message) {
        errorMessage = `등록 실패: ${err.response.data.message}`;
      } else if (err.response?.status) {
        errorMessage = `서버 오류 (${err.response.status}): 잠시 후 다시 시도해주세요.`;
      }

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center mb-8">포트폴리오 작성</h1>

      {/* 기본 정보 섹션 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">기본 정보</h2>

        <PortfolioWriteInput
          inputText="이름"
          placeholderText="홍길동"
          type="text"
          value={portfolioData.name}
          onChange={handleNameChange}
        />

        <PortfolioWriteInput
          inputText="한 줄 자기소개"
          placeholderText="안녕하세요, 열정과 패기로 준비된 신입 개발자 홍길동입니다."
          type="text"
          value={portfolioData.introduce}
          onChange={handleIntroChange}
        />

        <PortfolioWriteInput
          inputText="연락처"
          placeholderText="010-1234-5678"
          type="tel"
          value={portfolioData.phoneNumber}
          onChange={handlePhoneNumberChange}
        />

        <PortfolioWriteInput
          inputText="이메일"
          placeholderText="etch@example.com"
          type="email"
          value={portfolioData.email}
          onChange={handleEmailChange}
        />

        <PortfolioWriteInput
          inputText="GitHub"
          placeholderText="http://github.com/username/repository"
          type="url"
          value={portfolioData.githubUrl}
          onChange={handleGithubUrlChange}
        />

        {/* 블로그 URL 핸들러 수정 */}
        <PortfolioWriteInput
          inputText="블로그"
          placeholderText="http://blog.yourblog.com"
          type="url"
          value={portfolioData.blogUrl || ""}
          onChange={handleBlogUrlChange}
        />
      </div>

      {/* 기술 스택 섹션 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">보유 기술 스택</h2>
        <PortfolioStackSelect
          isStackData={PortfolioWriteStackData}
          isSelect={portfolioData.stack}
          onStackChange={handleStacksChange}
        />
      </div>

      {/* 프로젝트 섹션 */}
      <section>
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">프로젝트 경험</h2>
            <button
              onClick={() => setShowProjectSection(!showProjectSection)}
              className="flex items-center justify-center px-4 py-2 text-sm font-semibold transition-all duration-200 rounded cursor-pointer hover:brightness-90 border border-gray-300"
            >
              {showProjectSection ? "추가 -" : "추가 +"}
            </button>
          </div>
          <div className="border-b pb-2 mb-4"></div>

          {/* 프로젝트 작성 폼 */}
          {showProjectSection && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <PortfolioProjectPage
                projectData={projectData}
                onProjectDataChange={handleProjectDataChange}
              />
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                <button
                  onClick={handleRegisterProject}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  프로젝트 등록
                </button>
                <button
                  onClick={() => setShowProjectSection(false)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* 등록된 프로젝트 목록 */}
          {registeredProjects.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium">등록된 프로젝트</h3>
              {registeredProjects.map((project, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{project.title}</h4>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {project.content}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        {project.githubUrl && (
                          <span>
                            GitHub: {project.githubUrl.substring(0, 30)}...
                          </span>
                        )}
                        {project.youtubeUrl && (
                          <span>
                            YouTube: {project.youtubeUrl.substring(0, 30)}...
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveProject(index)}
                      className="text-red-500 hover:text-red-700 text-sm ml-4"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 교육/자격증 섹션 */}
      <section>
        <PortfolioWriteTextCard
          title="교육 / 수료 / 활동"
          type="education"
          education={parseEducationData(portfolioData.education)}
          onEducationAdd={handleActivityAdd}
          onEducationRemove={handleEducationRemove}
          showForm={showEducationForm}
          onToggleForm={() => setShowEducationForm(!showEducationForm)}
        />

        <PortfolioWriteTextCard
          title="자격증 및 어학"
          type="language"
          language={parseLanguageData(portfolioData.language)}
          onLanguageAdd={handleLicenseAdd}
          onLanguageRemove={handleLanguageRemove}
          showForm={showLanguageForm}
          onToggleForm={() => setShowLanguageForm(!showLanguageForm)}
        />
      </section>

      <PortfolioSubmitButton
        onSubmit={handleSubmit}
        isDisabled={
          isSubmitting || // 제출 중일 때 비활성화
          !portfolioData.name ||
          !portfolioData.phoneNumber ||
          !portfolioData.introduce
        }
      />

      {/* 제출 중 표시 (선택사항) */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>포트폴리오를 등록하고 있습니다...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MypagePortfolioPage;
