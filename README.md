# MCP Server Example

Node.js / Express / TypeScript 기반 MCP (Model Context Protocol) 서버

## 실행 방법

### 로컬 실행
```bash
npm install
npm run build
npm start

# 인증 토큰과 함께 실행
TOKEN=your_token npm start
```

### Docker 실행
```bash
docker build -t mcp-server-node .
docker run -p 3000:3000 -e TOKEN=your-secret-token mcp-server-node
```



## 배포하기

### 클라우드타입

1. **템플릿 선택하기** : `MCP Server - Node.js`

<p align="center">
  <img src="https://raw.githubusercontent.com/cloudtype-examples/assets/refs/heads/main/screenshots/mcp-server-node/select.png" width="600px">
</p>



2. **배포하기**

- **Node v22**
- **환경변수**
  `TOKEN` : 인증에 사용할 토큰을 설정 (인증시 사용할 토큰)
- **빌드 명령어**
   `npm run build`
- **시작 명령어**
   `npm start`
<p align="center">
  <img src="https://raw.githubusercontent.com/cloudtype-examples/assets/refs/heads/main/screenshots/mcp-server-node/config.png" width="600px">
</p>


3. **접속정보 확인**

   > MCP 접속 주소 - **https://<배포된 프리뷰 도메인 주소>/mcp**

<p align="center">
  <img src="https://raw.githubusercontent.com/cloudtype-examples/assets/refs/heads/main/screenshots/mcp-server-node/domain.png" width="600px">
</p>


4. **업데이트**
   코드 커밋 & 푸시 후 `설정` 탭에서 `배포하기` 버튼으로 배포



#### YouTube 가이드

- [MCP 서버 배포하기 - YouTube 가이드](https://www.youtube.com/watch?v=Y3AK40FVCbw)


#### 배포자동화

- [클라우드타입 GitHub Actions 가이드](https://docs.cloudtype.io/guide/cicd/github-actions)



## 인증

Bearer 토큰 인증을 사용합니다:
- 환경변수: `TOKEN`
- 헤더: `Authorization: Bearer your-token`



## 지원 도구

- **user_list** - 사용자 목록 조회
- **user_statistics** - 사용자 지표 조회
- **calculator** - 계산기 예제
- **create_task** : 작업 생성하기
- **complete_task** : 작업 완료하기
- **list_tasks** : 작업 목록 조회하기




## 환경변수

- **TOKEN** : Bearer 토큰 (**필수**)




## 활용방법

### Porter AI
- [Porter AI 에서 MCP 연결하기](https://docs.getporter.ai/ko/mcp) 
- [Slack 연동하기](https://docs.getporter.ai/ko/slack)
- [Porter AI](https://getporter.ai/)



## 문제해결

- [클라우드타입 가이드](https://docs.cloudtype.io/)
- [클라우드타입 디스코드](https://discord.gg/U7HX4BA6hu)




## License

MIT License