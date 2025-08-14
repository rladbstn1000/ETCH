import { useState } from "react";
import TabToggle from "../../molecules/mypage/tabToggle";
import DocumentItem from "../../molecules/mypage/documentItem";
import { useNavigate } from "react-router"; // Import useNavigate

import type { CoverLetterListResponse } from "../../../types/coverLetter";
import { deleteCoverLetter } from "../../../api/coverLetterApi"; // Import deleteCoverLetter API
import { deletePortfolio } from "../../../api/portfolioApi"; // Import deletePortfolio API

type PortfolioListResponse = any[];

interface MyDocumentsProps {
  coverLetters: CoverLetterListResponse[];
  portfolios: PortfolioListResponse;
  refetchCoverLetters: () => void; // Add refetchCoverLetters prop
  refetchPortfolios?: () => void; // Add refetchPortfolios prop
}

const MyDocuments = ({
  coverLetters,
  portfolios,
  refetchCoverLetters,
  refetchPortfolios,
}: MyDocumentsProps) => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [currentTab, setCurrentTab] = useState<"coverLetter" | "portfolio">(
    "coverLetter"
  );

  const currentDocuments =
    currentTab === "coverLetter" ? coverLetters : portfolios;

  const handleDelete = async (id: string) => {
    if (currentTab === "coverLetter") {
      const confirmDelete = window.confirm(
        "정말로 이 자기소개서를 삭제하시겠습니까?"
      );
      if (confirmDelete) {
        try {
          await deleteCoverLetter(Number(id)); // Convert id to Number for API call
          alert("자기소개서가 성공적으로 삭제되었습니다.");
          refetchCoverLetters(); // Refetch cover letters after successful deletion
        } catch (error) {
          console.error("자기소개서 삭제 실패:", error);
          alert("자기소개서 삭제에 실패했습니다. 다시 시도해주세요.");
        }
      }
    } else {
      // Portfolio deletion logic
      const confirmDelete = window.confirm(
        "정말로 이 포트폴리오를 삭제하시겠습니까?"
      );
      if (confirmDelete) {
        try {
          await deletePortfolio(Number(id)); // Convert id to Number for API call
          alert("포트폴리오가 성공적으로 삭제되었습니다.");
          refetchPortfolios?.(); // Refetch portfolios after successful deletion
        } catch (error) {
          console.error("포트폴리오 삭제 실패:", error);
          alert("포트폴리오 삭제에 실패했습니다. 다시 시도해주세요.");
        }
      }
    }
  };

  const handleDocumentClick = (id: string) => {
    if (currentTab === "coverLetter") {
      navigate(`/mypage/cover-letter-detail/${id}`); // Navigate to detail page
    } else {
      // Portfolio detail logic (to be implemented later)
      console.log(`View portfolio detail with ID: ${id}`);
      alert("포트폴리오 상세 보기 기능은 아직 구현되지 않았습니다.");
    }
  };

  const handleEditClick = (id: string) => {
    if (currentTab === "coverLetter") {
      navigate(`/mypage/cover-letter-edit/${id}`); // Navigate to edit page
    } else {
      // Portfolio edit logic - navigate to portfolio edit page
      navigate("/mypage/portfolio/edit"); // Navigate to portfolio edit page
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="border-b border-gray-200 p-6">
        <h3 className="text-lg font-semibold">내 문서</h3>
      </div>
      <div className="p-6">
        <div className="mb-4">
          <TabToggle currentTab={currentTab} onTabChange={setCurrentTab} />
        </div>

        <div className="space-y-3">
          {currentDocuments.length > 0 ? (
            currentDocuments.map((doc) => (
              <DocumentItem
                key={doc.id}
                id={doc.id.toString()}
                title={currentTab === "coverLetter" ? doc.name : doc.name}
                description={currentTab === "portfolio" ? doc.introduce : undefined}
                date={doc.date}
                onClick={handleDocumentClick} // Use handleDocumentClick for main click
                onDelete={handleDelete} // Pass the handleDelete function
                onEdit={handleEditClick} // Pass the handleEditClick function
              />
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              {currentTab === "coverLetter"
                ? "작성된 자기소개서가 없습니다."
                : "작성된 포트폴리오가 없습니다."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyDocuments;
