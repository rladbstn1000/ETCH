import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { searchAll } from "../../api/searchApi";
import type {
  SearchResponse,
  JobSearchResult,
  NewsSearchResult,
  Page,
} from "../../types/search";
import type { JobItemProps } from "../atoms/listItem";
import type { ProjectData } from "../../types/project/projectDatas";
import JobDetailModal from "../organisms/job/jobDetailModal";
import SearchJobList from "../organisms/job/searchJobList";
import NewsCard from "../molecules/home/newsCard";
import { useLikedNews } from "../../hooks/useLikedItems";
import { searchJobs, searchNews, searchProjects } from "../../api/searchApi";
import Pagination from "../common/pagination";
import ProjectListCard from "../organisms/project/list/projectListCard";

function SearchPage() {
  const [searchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<
    "all" | "jobs" | "news" | "projects"
  >("all");
  const [searchInput, setSearchInput] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  // 각 탭별 상세 데이터
  const [jobResults, setJobResults] = useState<Page<JobSearchResult> | null>(
    null
  );
  const [newsResults, setNewsResults] = useState<Page<NewsSearchResult> | null>(
    null
  );
  const [projectResults, setProjectResults] = useState<any>(null);

  // 각 탭별 페이지 상태
  const [jobPage, setJobPage] = useState(0);
  const [newsPage, setNewsPage] = useState(0);
  const [projectPage, setProjectPage] = useState(0);

  // 로딩 상태
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  const { isNewsLiked, addLikedNews, removeLikedNews } = useLikedNews();

  const query = searchParams.get("q") || "";

  // URL의 query가 변경되면 input도 동기화
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    if (query.trim()) {
      handleSearch(query);
    }
  }, [query]);

  // 탭이 변경될 때 해당 탭의 데이터 로드
  useEffect(() => {
    if (!query.trim()) return;

    if (activeTab === "jobs" && !jobResults) {
      loadJobResults(0);
      setJobPage(0);
    } else if (activeTab === "news" && !newsResults) {
      loadNewsResults(0);
      setNewsPage(0);
    } else if (activeTab === "projects" && !projectResults) {
      loadProjectResults(0);
      setProjectPage(0);
    }
  }, [activeTab, query]);

  const handleSearch = async (searchQuery: string) => {
    try {
      const results = await searchAll(searchQuery, 0, 4);
      setSearchResults(results);
    } catch (error) {
      console.error("검색 실패:", error);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      // URL을 업데이트하여 검색 실행
      window.location.href = `/search?q=${encodeURIComponent(
        searchInput.trim()
      )}`;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchSubmit(e as any);
    }
  };

  const handleJobClick = (jobId: number) => {
    setSelectedJobId(jobId);
  };

  const handleCloseModal = () => {
    setSelectedJobId(null);
  };

  const handleNewsLikeStateChange = (newsId: number, isLiked: boolean) => {
    if (isLiked) {
      addLikedNews(newsId);
    } else {
      removeLikedNews(newsId);
    }
  };

  // 각 탭별 데이터 로드 함수들
  const loadJobResults = async (page: number = 0) => {
    if (!query) return;

    try {
      setIsLoadingJobs(true);
      const results = await searchJobs({
        keyword: query,
        page,
        size: 9,
      });
      setJobResults(results);
    } catch (error) {
      console.error("채용 검색 실패:", error);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const loadNewsResults = async (page: number = 0) => {
    if (!query) return;

    try {
      setIsLoadingNews(true);
      const results = await searchNews({
        keyword: query,
        page,
        size: 10,
      });
      setNewsResults(results);
    } catch (error) {
      console.error("뉴스 검색 실패:", error);
    } finally {
      setIsLoadingNews(false);
    }
  };

  const loadProjectResults = async (page: number = 0) => {
    if (!query) return;

    try {
      setIsLoadingProjects(true);
      const results = await searchProjects({
        keyword: query,
        page,
        size: 8,
      });
      setProjectResults(results);
    } catch (error) {
      console.error("프로젝트 검색 실패:", error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // NewsSearchResult를 NewsCard props에 맞게 변환하는 함수
  const convertNewsToCardProps = (news: NewsSearchResult) => ({
    id: news.id,
    title: news.title,
    url: news.link,
    publishedAt: news.publishedAt,
    description: news.summary,
    companyName: news.companyName,
    type: "news" as const,
    isLiked: isNewsLiked(news.id),
    onLikeStateChange: handleNewsLikeStateChange,
  });

  // JobSearchResult를 JobItemProps 타입으로 변환하는 함수
  const convertJobSearchResultToJobItem = (
    jobSearchResult: JobSearchResult
  ): JobItemProps => ({
    id: jobSearchResult.id.toString(), // string으로 변환
    title: jobSearchResult.title,
    companyName: jobSearchResult.companyName,
    companyId: 0, // 검색 결과에는 companyId가 없으므로 기본값 사용
    regions: jobSearchResult.regions,
    industries: jobSearchResult.industries,
    jobCategories: jobSearchResult.jobCategories,
    workType: jobSearchResult.workType,
    educationLevel: jobSearchResult.educationLevel,
    openingDate: jobSearchResult.openingDate,
    expirationDate: jobSearchResult.expirationDate,
  });

  // ProjectSearchResult를 ProjectData로 변환하는 함수
  const convertProjectSearchResultToProjectData = (
    projectSearchResult: any // 실제 백엔드 응답 구조를 반영
  ): ProjectData => {
    const converted = {
      id: projectSearchResult.projectId || projectSearchResult.id, // 백엔드는 projectId 사용
      title: projectSearchResult.title,
      content: projectSearchResult.description || "", // description이 없는 경우 빈 문자열
      thumbnailUrl: projectSearchResult.thumbnailUrl || "",
      youtubeUrl: "",
      viewCount: projectSearchResult.viewCount || 0,
      projectCategory: projectSearchResult.category as any,
      createdAt: projectSearchResult.createdDate || "",
      updatedAt: projectSearchResult.createdDate || "",
      isDeleted: false,
      githubUrl: "",
      isPublic: projectSearchResult.isPublic || true,
      likeCount: projectSearchResult.likeCount || 0,
      commentCount: 0,
      popularityScore: 0,
      nickname: projectSearchResult.memberName || "", // 백엔드는 memberName 사용
      likedByMe: projectSearchResult.likedByMe || false, // 실제 백엔드 값 사용
      memberId: 0,
      profileUrl: "",
      member: { id: 0, nickname: "" },
      files: [],
      fileUrls: [],
      techCodes: [],
      techCategories: [],
      projectTechs: [],
    };
    return converted;
  };

  // 현재 활성 탭에 따라 올바른 데이터 소스에서 selectedJob 찾기
  const findSelectedJob = () => {
    if (!selectedJobId) return null;

    let foundJob = null;

    // 현재 탭에 따라 해당 탭의 데이터에서 먼저 찾기
    if (activeTab === "jobs" && jobResults?.content) {
      foundJob = jobResults.content.find(
        (job) => job.id === Number(selectedJobId)
      );
    }

    // 찾지 못했거나 전체 탭인 경우 전체 검색 결과에서 찾기
    if (!foundJob && searchResults?.jobs.content) {
      foundJob = searchResults.jobs.content.find(
        (job) => job.id === Number(selectedJobId)
      );
    }

    return foundJob;
  };

  const selectedJob = findSelectedJob();
  const convertedSelectedJob = selectedJob
    ? convertJobSearchResultToJobItem(selectedJob)
    : null;

  const tabs = [
    {
      id: "all",
      label: "전체",
      count: searchResults
        ? searchResults.jobs.page.totalElements +
          searchResults.news.page.totalElements +
          searchResults.projects.page.totalElements
        : 0,
    },
    {
      id: "jobs",
      label: "채용",
      count: searchResults?.jobs.page.totalElements ?? 0,
    },
    {
      id: "news",
      label: "뉴스",
      count: searchResults?.news.page.totalElements ?? 0,
    },
    {
      id: "projects",
      label: "프로젝트",
      count: searchResults?.projects.page.totalElements ?? 0,
    },
  ] as const;

  return (
    <div className="min-h-screen">
      {/* 상단 헤더 */}
      <div>
        <div className="px-6 py-6 mx-auto text-center max-w-7xl">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">통합 검색</h1>
          <p className="text-gray-600">'{query}'에 대한 검색 결과입니다</p>
        </div>
      </div>

      {/* 검색바*/}
      <div className="border-b border-gray-200 ">
        <div className="px-6 py-4 mx-auto max-w-7xl">
          <div className="flex justify-center">
            {/* 검색바 */}
            <div className="w-full max-w-2xl">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="검색어를 입력하세요"
                  className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="absolute text-gray-500 transform -translate-y-1/2 right-3 top-1/2 hover:text-blue-600"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="px-6 mx-auto max-w-7xl">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-4 font-semibold transition-all duration-300 transform ${
                  activeTab === tab.id
                    ? "text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg scale-105 -mb-px"
                    : "text-gray-600 bg-gray-50 hover:text-gray-800 hover:bg-gray-100 hover:scale-102"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      activeTab === tab.id
                        ? "bg-white/20 text-white"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </div>
                {/* 활성 탭 하단 인디케이터 */}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 w-4 h-1 transform -translate-x-1/2 bg-white rounded-t-full left-1/2"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="px-6 py-8 mx-auto max-w-7xl">
        {activeTab === "all" && (
          <div className="space-y-12">
            {/* 채용 섹션 */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  채용 ({searchResults?.jobs.page.totalElements ?? 0})
                </h2>
                <button
                  className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 group"
                  onClick={() => setActiveTab("jobs")}
                >
                  더보기
                  <svg
                    className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
              <div className="bg-white border-gray-200 rounded-lg shadow-sm">
                {searchResults?.jobs.content.length ? (
                  <SearchJobList
                    jobs={searchResults.jobs.content.map((job) =>
                      convertJobSearchResultToJobItem(job)
                    )}
                    onJobClick={(jobId) => handleJobClick(Number(jobId))}
                    maxItems={4}
                    gridCols="grid-cols-1 md:grid-cols-2"
                  />
                ) : (
                  <div className="flex items-center justify-center h-24 text-gray-500">
                    검색 결과가 없습니다
                  </div>
                )}
              </div>
            </section>

            {/* 뉴스 섹션 */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  뉴스 ({searchResults?.news.page.totalElements ?? 0})
                </h2>
                <button
                  className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 group"
                  onClick={() => setActiveTab("news")}
                >
                  더보기
                  <svg
                    className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-6 bg-white border-gray-200 rounded-lg shadow-sm">
                {searchResults?.news.content.length ? (
                  <div className="space-y-3">
                    {searchResults.news.content.map((news) => (
                      <NewsCard
                        key={news.id}
                        {...convertNewsToCardProps(news)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-24 text-gray-500">
                    검색 결과가 없습니다
                  </div>
                )}
              </div>
            </section>

            {/* 프로젝트 섹션 */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  프로젝트 ({searchResults?.projects.page.totalElements ?? 0})
                </h2>
                <button
                  className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 group"
                  onClick={() => setActiveTab("projects")}
                >
                  더보기
                  <svg
                    className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-6 bg-white border-gray-200 rounded-lg shadow-sm">
                {searchResults?.projects.content.length ? (
                  <div className="">
                    <ProjectListCard
                      projects={searchResults.projects.content
                        .slice(0, 4)
                        .map(convertProjectSearchResultToProjectData)}
                      onProjectUpdate={() => {
                        // 전체 탭의 프로젝트 업데이트 - 전체 검색 결과 새로고침

                        // 전체 검색 결과 새로고침
                        setTimeout(() => {
                          handleSearch(query);
                        }, 100);
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-24 text-gray-500">
                    검색 결과가 없습니다
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* 개별 탭 콘텐츠 */}
        {activeTab === "jobs" && (
          <div className="space-y-6">
            {/* 채용 결과 헤더 */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                채용 검색 결과 ({jobResults?.page.totalElements ?? 0}개)
              </h2>
            </div>

            {/* 채용 리스트 */}
            <div className="bg-white rounded-lg shadow-sm">
              {isLoadingJobs ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-8 h-8 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
                </div>
              ) : jobResults?.content.length ? (
                <SearchJobList
                  jobs={jobResults.content.map((job) =>
                    convertJobSearchResultToJobItem(job)
                  )}
                  onJobClick={(jobId) => handleJobClick(Number(jobId))}
                  maxItems={jobResults.content.length}
                  gridCols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                />
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-500">
                  검색 결과가 없습니다
                </div>
              )}
            </div>

            {/* 페이지네이션 */}
            {jobResults && jobResults.page.totalPages > 1 && (
              <Pagination
                currentPage={jobPage + 1}
                totalPages={jobResults.page.totalPages}
                totalElements={jobResults.page.totalElements}
                isLast={jobPage + 1 >= jobResults.page.totalPages}
                onPageChange={(page) => {
                  const zeroBasedPage = page - 1;
                  loadJobResults(zeroBasedPage);
                  setJobPage(zeroBasedPage);
                }}
                itemsPerPage={10}
              />
            )}
          </div>
        )}

        {activeTab === "news" && (
          <div className="space-y-6">
            {/* 뉴스 결과 헤더 */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                뉴스 검색 결과 ({newsResults?.page.totalElements ?? 0}개)
              </h2>
            </div>

            {/* 뉴스 리스트 */}
            <div className="bg-white rounded-lg shadow-sm">
              {isLoadingNews ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-8 h-8 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
                </div>
              ) : newsResults?.content.length ? (
                <div className="p-6 space-y-4">
                  {newsResults.content.map((news) => (
                    <NewsCard key={news.id} {...convertNewsToCardProps(news)} />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-500">
                  검색 결과가 없습니다
                </div>
              )}
            </div>

            {/* 페이지네이션 */}
            {newsResults && newsResults.page.totalPages > 1 && (
              <Pagination
                currentPage={newsPage + 1}
                totalPages={newsResults.page.totalPages}
                totalElements={newsResults.page.totalElements}
                isLast={newsPage + 1 >= newsResults.page.totalPages}
                onPageChange={(page) => {
                  const zeroBasedPage = page - 1;
                  loadNewsResults(zeroBasedPage);
                  setNewsPage(zeroBasedPage);
                }}
                itemsPerPage={10}
              />
            )}
          </div>
        )}

        {activeTab === "projects" && (
          <div className="space-y-6">
            {/* 프로젝트 결과 헤더 */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                프로젝트 검색 결과 ({projectResults?.page.totalElements ?? 0}개)
              </h2>
            </div>

            {/* 프로젝트 리스트 */}
            <div className="bg-white rounded-lg shadow-sm">
              {isLoadingProjects ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-8 h-8 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
                </div>
              ) : projectResults?.content.length ? (
                <div className="p-4">
                  <ProjectListCard
                    projects={projectResults.content.map(
                      convertProjectSearchResultToProjectData
                    )}
                    onProjectUpdate={() => {
                      // 프로젝트 탭 업데이트 - 현재 페이지 새로고침

                      // 현재 페이지 데이터 새로고침
                      setTimeout(() => {
                        loadProjectResults(projectPage);
                      }, 100);
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-500">
                  검색 결과가 없습니다
                </div>
              )}
            </div>

            {/* 페이지네이션 */}
            {projectResults && projectResults.page.totalPages > 1 && (
              <Pagination
                currentPage={projectPage + 1}
                totalPages={projectResults.page.totalPages}
                totalElements={projectResults.page.totalElements}
                isLast={projectPage + 1 >= projectResults.page.totalPages}
                onPageChange={(page) => {
                  const zeroBasedPage = page - 1;
                  loadProjectResults(zeroBasedPage);
                  setProjectPage(zeroBasedPage);
                }}
                itemsPerPage={8}
              />
            )}
          </div>
        )}
      </div>

      {/* JobDetailModal */}
      {convertedSelectedJob && (
        <JobDetailModal job={convertedSelectedJob} onClose={handleCloseModal} />
      )}
    </div>
  );
}

export default SearchPage;
