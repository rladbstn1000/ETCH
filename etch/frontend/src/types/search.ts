// 페이지네이션 정보 인터페이스
export interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

// 페이지네이션 인터페이스
export interface Page<T> {
  content: T[];
  page: PageInfo;
}

// 채용 검색 결과
export interface JobSearchResult {
  id: number;
  title: string;
  companyName: string;
  industries: string[];
  regions: string[];
  jobCategories: string[];
  workType: string;
  educationLevel: string;
  openingDate: string;
  expirationDate: string;
}

// 뉴스 검색 결과
export interface NewsSearchResult {
  id: number;
  title: string;
  summary: string;
  companyName: string;
  link: string;
  thumbnailUrl?: string;
  publishedAt: string;
}

// 프로젝트 검색 결과
export interface ProjectSearchResult {
  id: number;
  title: string;
  description: string;
  category: string;
  createdDate: string;
  memberCount: number;
  isPublic: boolean;
  thumbnail?: string;
}

// 통합 검색 응답
export interface SearchResponse {
  jobs: Page<JobSearchResult>;
  news: Page<NewsSearchResult>;
  projects: Page<ProjectSearchResult>;
}

// 검색 필터 (채용)
export interface JobSearchFilters {
  keyword?: string;
  regions?: string[];
  jobCategories?: string[];
  workType?: string;
  educationLevel?: string;
  page?: number;
  size?: number;
}

// 검색 필터 (뉴스)
export interface NewsSearchFilters {
  keyword?: string;
  page?: number;
  size?: number;
}

// 검색 필터 (프로젝트)
export interface ProjectSearchFilters {
  keyword?: string;
  category?: string;
  sort?: "LATEST" | "POPULAR";
  page?: number;
  size?: number;
}
