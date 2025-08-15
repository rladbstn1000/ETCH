import { useState } from "react";
import JobHeader from "../../organisms/job/jobHeader";
import JobList from "../../organisms/job/jobList";
import CalendarView from "../../organisms/job/calendarView";
import JobDetailModal from "../../organisms/job/jobDetailModal";
import { useJobs } from "../../../hooks/useJobs";

export default function JobPage() {
  console.log('[JobPage] Component rendered');
  
  const [currentView, setCurrentView] = useState<"list" | "calendar">(
    "calendar"
  );
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());
  const [currentDateRange, setCurrentDateRange] = useState<{start: Date, end: Date} | undefined>(undefined);
  
  // custom hook 사용
  const { jobs, loading, error, handleDateRangeChange } = useJobs();

  const handleDateRangeChangeWrapper = (startDate: Date, endDate: Date) => {
    setCurrentDateRange({ start: startDate, end: endDate });
    handleDateRangeChange(startDate, endDate);
  };
  
  console.log('[JobPage] Current state:', {
    currentView,
    selectedJobId,
    jobsCount: jobs.length,
    loading,
    error
  });

  const handleViewChange = (view: "list" | "calendar") => {
    setCurrentView(view);
  };

  const handleFilterClick = () => {
    console.log("필터 클릭됨");
  };

  const handleJobClick = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  const handleCloseModal = () => {
    setSelectedJobId(null);
  };

  const selectedJob = jobs.find((job) => job.id === selectedJobId);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <JobHeader
        currentView={currentView}
        onViewChange={handleViewChange}
        onFilterClick={handleFilterClick}
      />

      <div className="mt-6">
        {currentView === "list" && (
        <JobList 
          jobs={jobs} 
          onJobClick={handleJobClick}
          dateRange={currentDateRange}
        />
      )}
        {currentView === "calendar" && (
          <CalendarView
            jobList={jobs}
            onEventClick={handleJobClick}
            onDateRangeChange={handleDateRangeChangeWrapper}
            currentDate={currentCalendarDate}
            onDateChange={setCurrentCalendarDate}
          />
        )}
      </div>
      
      {/* 로딩 중일 때 오버레이 */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <div className="text-lg text-gray-600 font-medium">채용달력을 불러오고 있어요</div>
              <div className="text-sm text-gray-500 mt-2">잠시만 기다려주세요...</div>
            </div>
          </div>
        </div>
      )}

      {selectedJob && (
        <JobDetailModal job={selectedJob} onClose={handleCloseModal} />
      )}
    </div>
  );
}
