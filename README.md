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

## 테스트

```bash
npm test              # 기본 테스트
npm run test:mcp      # MCP 기능 테스트
```

## Docker

```bash
docker build -t mcp-server .
docker run -p 3000:3000 -e TOKEN=your_token mcp-server
```

## API

- **POST** `/mcp`
- **GET** `/mcp`
- **DELETE** `/mcp`

### Tools
- `create_task(title, description?)` - 작업 생성
- `complete_task(task_id)` - 작업 완료
- `list_tasks()` - 작업 목록
- `health_check()` - 서버 상태

### Resources
- `tasks://all` - 모든 작업
- `tasks://pending` - 대기 작업
- `tasks://completed` - 완료 작업
