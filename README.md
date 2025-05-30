# 🐊 악어새 크롬 확장 프로그램

**악어새(Crocodile Bird)**는 웹 페이지의 텍스트 노드를 탐색하고, 공격적이거나 부적절한 언어를 정제하는 크롬 확장 프로그램입니다.  
사용자는 단계별로 순화 수준을 조절할 수 있으며, 확장 버튼에서 간단히 호출/해제 및 단계 설정이 가능합니다.

---

## 🔧 주요 기능

- ✅ 웹 페이지 텍스트 자동 정제 (단계별 설정 가능)
- ✅ 악어새 오버레이 애니메이션 제공
- ✅ 사용자 UI로 간편한 ON/OFF 및 레벨 조절
- ✅ sessionStorage + chrome.storage.local 캐싱
- ✅ GPT API 연동 정제 요청 처리 (`controller.js`)

---

## 📁 프로젝트 구조

```text
my-extension/
├── src/                             # 소스 코드
│   ├── content.js                   # DOM 순회 및 텍스트 정제
│   └── controller.js                # background 역할 (GPT API 중계)
│
├── popup.html                       # 사용자 인터페이스
├── popup.js                         # toggle/단계 버튼 핸들러
├── prompts.js                       # GPT 시스템 프롬프트
├── icons/                           # 애니메이션 이미지 프레임
├── manifest.json                    # 크롬 확장 정의 파일
├── vite.config.js                   # Vite 빌드 설정
├── package.json                     # 의존성 및 빌드 스크립트
├── README.md                        # 이 문서
└── dist/                            # Vite 빌드 결과 (배포 대상)
    ├── content.js
    ├── controller.js
    ├── popup.html
    ├── popup.js
    ├── prompts.js
    ├── icons/
    └── manifest.json

---

## 파비콘 출처
- https://www.flaticon.com/kr/free-icons/