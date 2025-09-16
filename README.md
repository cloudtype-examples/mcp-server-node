# MCP Server Example

Node.js / Express / TypeScript 기반 MCP (Model Context Protocol) 서버

## 설치 및 실행

```bash
npm install
npm run build
npm start

# 인증과 함께 실행
TOKEN=your_token npm start
```

## 환경 변수

- **TOKEN** : 인증 토큰 (필수)

## 접속 및 인증
### 접속 주소 (로컬)
```
http://localhost:3000/mcp
```

### 접속 주소 (서버 배포)
```
https://<도메인>/mcp
```

### 헤더 (인증)
HTTP 요청시 헤더에 `Authorization` 를 아래와 같이 설정

```
Authorization: Bearer <TOKEN>
```

## Tools
- `user_list` - 사용자 목록 조회
- `user_statistics` - 사용자 지표 조회
- `calculator` - 계산기 예제
- `list_tasks` - 작업 목록
- `create_task` - 작업 생성
- `complete_task` - 작업 완료