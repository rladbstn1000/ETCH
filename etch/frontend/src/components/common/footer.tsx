import { Link } from "react-router";
import logo from "../../assets/logo.webp";

function Footer() {
  return (
    <footer className="bg-white">
      <div className="px-6 py-8 mx-auto max-w-screen-2xl sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center justify-center mb-4 md:justify-start">
              <img src={logo} alt="로고" className="w-36 h-13s" />
            </div>
            <p className="text-sm text-center text-gray-600 md:text-left">
              IT 취업 준비를 위한 모든 것을 한 곳에서 제공하는 플랫폼입니다.
            </p>
          </div>
          <div>
            <h3 className="mb-4 font-semibold text-center md:text-left">
              서비스
            </h3>
            <ul className="space-y-2 text-sm text-center text-gray-600 md:text-left">
              <li>
                <Link to={"/jobs"}>
                  <span className="text-gray-600">채용공고</span>
                </Link>
              </li>
              <li>
                <Link to={"/news"}>
                  <span className="text-gray-600">뉴스</span>
                </Link>
              </li>
              <li>
                <Link to={"/projects"}>
                  <span className="text-gray-600">프로젝트</span>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-semibold text-center md:text-left">
              문의하기
            </h3>
            <ul className="space-y-2 text-sm text-center text-gray-600 md:text-left">
              <li>이메일: h2sorginal@gmail.com</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center mt-8 md:flex-row md:justify-between">
          <p className="mb-2 text-sm text-center text-gray-600 md:text-left md:mb-0">
            © 2025 ETCH. All rights reserved.
          </p>
          <p className="text-xs text-center text-gray-500 md:text-left">
            Developer: SeungSu, JaeBin, HyunJi, SungHyun, YoonSu, SungMin
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
