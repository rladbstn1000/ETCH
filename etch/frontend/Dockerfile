# etch/frontend/Dockerfile

# --- 1. 빌드(Build) 스테이지 ---
# Node.js 20-alpine 버전을 빌드 환경으로 사용합니다. 'builder'라는 별명을 붙여줍니다.
FROM node:20-alpine AS builder

# 작업 디렉토리를 /app 으로 설정합니다.
WORKDIR /app

# package.json과 package-lock.json을 먼저 복사합니다.
# 이렇게 하면 의존성이 변경되지 않았을 경우 Docker 캐시를 활용해 빌드 속도를 높일 수 있습니다.
COPY package.json package-lock.json ./

# npm ci는 package-lock.json을 기반으로 의존성을 정확하고 빠르게 설치합니다. CI 환경에 더 적합합니다.
RUN npm ci

# 소스 코드 전체를 복사합니다.
COPY . .

# React 앱을 빌드합니다. 결과물은 /app/dist 폴더에 생성됩니다.
RUN npm run build

# --- 2. 서비스(Serve) 스테이지 ---
# 웹서버인 Nginx를 서비스 환경으로 사용합니다.
FROM nginx:1.27-alpine

# 빌드 스테이지('builder')의 빌드 결과물(/app/dist)을 Nginx가 웹 콘텐츠를 서빙하는 기본 폴더로 복사합니다.
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx가 3000번 포트를 사용하도록 설정 파일을 복사합니다. (아래 custom-nginx.conf 파일 생성 필요)
COPY nginx/custom-nginx.conf /etc/nginx/conf.d/default.conf

# 3000번 포트를 외부에 노출합니다.
EXPOSE 3000

# 컨테이너가 시작될 때 Nginx를 실행합니다.
CMD ["nginx", "-g", "daemon off;"]
