import { useState, useEffect } from "react";
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
import { getMyPortfolio, updatePortfolio, convertPortfolioDataToRequest } from "../../../api/portfolioApi";

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

function MypagePortfolioEditPage() {
  const [portfolioData, setPortfolioData] = useState<portfolioDatas>({
    ...PortfolioState,
    stack: [] as PortfolioStackEnum[],
  });

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  const [portfolioId, setPortfolioId] = useState<number | null>(null);

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

  // 기존 포트폴리오 데이터 로드
  useEffect(() => {
    const loadPortfolioData = async () => {
      try {
        setIsLoading(true);
        const existingPortfolio = await getMyPortfolio();
        
        // API 응답을 portfolioDatas 형태로 변환
        setPortfolioData({
          name: existingPortfolio.name,
          phoneNumber: existingPortfolio.phoneNumber,
          email: existingPortfolio.email,
          blogUrl: existingPortfolio.blogUrl,
          githubUrl: existingPortfolio.githubUrl,
          introduce: existingPortfolio.introduce,
          stack: existingPortfolio.stack.map(id => id.toString()) as PortfolioStackEnum[], // 숫자 ID를 문자열로 변환
          language: existingPortfolio.language,
          education: existingPortfolio.education,
        });
        
        setPortfolioId(existingPortfolio.portfolioId);
        console.log("기존 포트폴리오 로드 완료:", existingPortfolio);
      } catch (error) {
        console.error("포트폴리오 로드 실패:", error);
        alert("포트폴리오를 불러올 수 없습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPortfolioData();
  }, []);

  // ============== 파싱 함수들 (화면 표시용만) ==============

  // 문자열을 배열로 파싱 (화면 표시용)
  const parseEducationData = (educationString: string): education[] => {
    if (!educationString) return [];

    const educationItems = educationString
      .split("/")
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
      .split("/")
      .filter((item) => item.trim());
    return languageItems.map((item) => {
      const [licenseName, issuer, getAt] = item.split("^");
      return {
        licenseName: licenseName || "",
        issuer: issuer || "",
        getAt: getAt || "",
      };
    });
  };

  // 배열을 문자열로 변환 (삭제 기능용만)
  const arrayToEducationString = (educations: education[]): string => {
    return educations
      .map(
        (edu) => `${edu.companyName}^${edu.active}^${edu.startAt}^${edu.endAt}`
      )
      .join("/");
  };

  const arrayToLanguageString = (languages: language[]): string => {
    return languages
      .map((lang) => `${lang.licenseName}^${lang.issuer}^${lang.getAt}`)
      .join("/");
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
      blogUrl: value,
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
      ? `${portfolioData.education}/${educationString}`
      : educationString;

    setPortfolioData((prev) => ({
      ...prev,
      education: newEducationString,
    }));

    console.log("교육/활동 추가됨:", educationString);
  };

  const handleLicenseAdd = (languageString: string) => {
    // 기존 문자열에 새 항목 추가
    const newLanguageString = portfolioData.language
      ? `${portfolioData.language}/${languageString}`
      : languageString;

    setPortfolioData((prev) => ({
      ...prev,
      language: newLanguageString,
    }));

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

  const handleSubmit = async () => {
    try {
      // 포트폴리오 기본 정보 유효성 검사
      if (
        !portfolioData.name ||
        !portfolioData.phoneNumber ||
        !portfolioData.introduce
      ) {
        alert("필수 정보를 모두 입력해주세요.");
        return;
      }

      if (!portfolioId) {
        alert("포트폴리오 ID를 찾을 수 없습니다.");
        return;
      }

      console.log("수정할 포트폴리오 데이터:", portfolioData);
      console.log("수정할 프로젝트 데이터:", registeredProjects);

      // portfolioData를 API 요청 형태로 변환
      const apiRequestData = convertPortfolioDataToRequest(portfolioData);
      console.log("API 전송용 데이터:", apiRequestData);

      // 포트폴리오 수정
      await updatePortfolio(portfolioId, apiRequestData);
      alert("포트폴리오가 성공적으로 수정되었습니다!");

      // TODO: 등록된 프로젝트들 생성 API 호출
      // for (const project of registeredProjects) {
      //   const projectInput = {
      //     title: project.title,
      //     content: project.content,
      //     projectCategory: project.projectCategory,
      //     techCodeIds: project.projectTechs,
      //     githubUrl: project.githubUrl,
      //     youtubeUrl: project.youtubeUrl,
      //     isPublic: project.isPublic,
      //     thumbnailFile: project.thumbnailFile,
      //     imageFiles: project.files.filter(file => file.type.startsWith('image/'))
      //   };
      //   await createProject(projectInput);
      // }

    } catch (error) {
      console.error("포트폴리오 수정 실패:", error);
      alert("포트폴리오 수정 중 오류가 발생했습니다.");
    }
  };

  // 로딩 중일 때 표시
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">포트폴리오 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center mb-8">포트폴리오 수정</h1>

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
        <PortfolioWriteInput
          inputText="블로그"
          placeholderText="http://blog.yourblog.com"
          type="url"
          value={portfolioData.blogUrl}
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
          !portfolioData.name ||
          !portfolioData.phoneNumber ||
          !portfolioData.introduce
        }
        submitButtonText="포트폴리오 수정"
      />
    </div>
  );
}

export default MypagePortfolioEditPage;