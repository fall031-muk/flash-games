# Flash Games

옛날 플래시게임 스타일의 미니게임을 모아놓은 사이트입니다. 총알피하기, 공튀기기 같은 단순하고 중독성 있는 브라우저 게임을 한 곳에서 즐길 수 있습니다.

## 기술 스택

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS** — UI 스타일링
- **Phaser 3** — 게임 엔진
- **Vercel** — 배포

## 로컬 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인 가능합니다.

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx          # 게임 목록 홈
│   └── games/            # 각 게임 페이지
└── components/
    └── games/            # Phaser 게임 컴포넌트
```

## 로드맵

- [ ] 공튀기기 (Ball Bounce)
- [ ] 총알피하기 (Bullet Dodge)
- [ ] 추가 게임 확장 예정
- [ ] 점수 저장 / 랭킹 시스템
- [ ] 구글 애드센스 연동

#flashgames #minigames #phaser #nextjs #webgame
