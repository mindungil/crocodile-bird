/**
 * 초기화 목록
 * 1. window.__crocodileBirdBot__ 으로 content.js 주입 확인
 * 2. 단계 초기화(popup에서의 초기화는 pop ui만 관련)
 * 3. crocodileBirdActive 초기화
 * 
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TOGGLE_BIRD_OFF") {
    window.crocodileBirdActive = false;
    removeOverlay();
    console.log("악어새 기능 중단");

    sendResponse({ok: true});
    return;
  }
  // 스텝 변경 후 다시 텍스트 처리
  else if (message.type === "SET_STEP"){
    window.crocodileBirdStep = message.step;
    console.log(`${message.step} 단계로 설정`);
  }

  // 페이지 처리 필요 없음
  if(isInformationalPage()) {
    console.log(`이 페이지는 안전한 페이지 입니다.`); 
    sendResponse({ok: true});
    return;
  }

  if(window.crocodileBirdStep == undefined) window.crocodileBirdStep = 2;
  console.log(`악어새 봇이 ${window.crocodileBirdStep}단계로 돌아가는 중 입니다....`);

  window.crocodileBirdActive = true;
  chrome.storage.local.get('step', data => {
    window.crocodileBirdStep = data.step || 1;
    walkTextNodes();
    sendResponse({ok: true});
  });

  return true;
});

// 웹 페이지 내의 텍스트 노드를 모두 탐색, 순회, 응답 텍스트로 대체
async function walkTextNodes() {
  // 함수 시작 로그
  console.log('[Content] content.js loaded');

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];

  window.crocodileBirdActive = window.crocodileBirdActive || false;
  window.crocodileBirdStep = window.crocodileBirdStep || 3;

  // 텍스트 노드를 하나씩 순회, 유효한 텍스트만 저장
  // TreeWalker은 DOM 트리 구조를 순회

  let i = 0;
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const tag = node.parentNode?.nodeName;

    // 필요 없는 text 제외
    if (["SCRIPT", "STYLE", "TEMPLATE", "NOSCRIPT", "NAV", "FIGCAPTION", "HEADER", "FOOTER", "FORM", "INPUT","BUTTON","SELECT","LABEL"].includes(tag) || !node.nodeValue.trim()) {
      continue;
    }


    nodes.push(node);
    i++;
  }

  console.log('오버레이가 시작됩니다.')
  // 오버레이 삽입( 대기시간 )
  showOverlay();

  const markedInput = await buildMarkedInput(nodes);

  // 순화 처리 - 오버레이 제거까지
  await cleanNodes(nodes, markedInput);
  
  // nodes 배열 -> [NODE_i] mesage 형식으로 구조화
  function buildMarkedInput(group) {
    return group
    .map((node, i) => `[NODE_${i}] ${node.nodeValue.trim()}`)
    .join("\n");
  }

  // 원래의 nodes 배열에 값 대입
  function parseMarkedOutput(gptResponse, count) {
    const results = new Array(count).fill("");

    const regex = /\[NODE_(\d+)\]\s*([\s\S]*?)(?=\[NODE_\d+\]|\s*$)/g;
    let match;

    while ((match = regex.exec(gptResponse)) !== null) {
      const idx = parseInt(match[1], 10);
      const text = match[2].trim();
      if (idx < count) {
        results[idx] = text;
      }
    }
    return results;
  }


  // 노드 순회 -> controller로 요청 보내서 텍스트 변경
  // 메시지 전송 함수 따로 분리
  async function sendCleanRequest(text, num) {
    console.log(`sendCleanRequest 함수 호출`);
    return new Promise(resolve => {
      chrome.runtime.sendMessage({ type: 'crocodile-bird-clean', text, num }, res => {
        resolve(res?.cleaned);
      });
    });
  }

  // 비동기 순화 처리
  async function cleanNodes(nodes, markedInput) {
    const num = window.crocodileBirdStep;

    const cleaned = await sendCleanRequest(markedInput, num);
    
    if(!cleaned) {
      console.log('API 응답이 비어있음');
      return;
    }
    
    const parsed = parseMarkedOutput(cleaned, nodes.length);

    // 입력 받은 배열을 다시 적용
    nodes.forEach((node, i) => {
      node.nodeValue = parsed[i] || node.nodeValue;
    })

    removeOverlay();
    console.log(`총 ${nodes.length}건의 순화 완료`);
  }
}

// 오버레이 설정 및 제거
// 다크모드 적용 필요(추후에)
function showOverlay() {
  console.log('오버레이가 화면에 나타납니다.');
  const el = document.createElement('div');
  el.id = 'crocodile-bird-overlay';

  // 오버레이 전체 스타일
  Object.assign(el.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2147483647
  });

  // 내부 콘텐츠 래퍼
  const wrapper = document.createElement('div');
  Object.assign(wrapper.style, {
    display: 'flex',
    flexDirection: 'column', // 🔁 세로 정렬로 변경
    alignItems: 'center',
    gap: '16px', // 이미지와 텍스트 간 간격
    fontSize: '20px',
    color: '#000'
  });

  // 텍스트
  const loadingText = document.createElement('span');
  loadingText.textContent = `순화 작업 중...\n 악어새가 열일하는 중입니다`;

  // 이미지 엘리먼트
  const img = document.createElement('img');
  img.style.width = '65vw';   // ⬅️ 여기 크기 조절
  img.style.height = '45vh';
  img.style.display = 'block';

  // 이미지 프레임들
  const frames = [
    chrome.runtime.getURL('icons/0.png'),
    chrome.runtime.getURL('icons/1.png'),
    chrome.runtime.getURL('icons/2.png'),
    chrome.runtime.getURL('icons/3.png'),
    chrome.runtime.getURL('icons/4.png'),
    chrome.runtime.getURL('icons/5.png'),
    chrome.runtime.getURL('icons/6.png'),
    chrome.runtime.getURL('icons/7.png'),
  ];
  let currentFrame = 0;

  // 애니메이션 루프
  const intervalId = setInterval(() => {
    img.src = frames[currentFrame];
    currentFrame = (currentFrame + 1) % frames.length;
  }, 400);

  el.dataset.intervalId = intervalId;

  // 조립
  wrapper.appendChild(img);
  wrapper.appendChild(loadingText);
  el.appendChild(wrapper);
  document.body.appendChild(el);
}

function removeOverlay() {
  console.log('오버레이가 화면에서 제거되는 중 입니다.');
  const el = document.getElementById('crocodile-bird-overlay');
  
  // el 오버레이의 NULL 제거 방지
  if (el) {
      // 동작도 제거해야함
      const id = parseInt(el.dataset.intervalId);
      clearInterval(el.dataset.intervalId);
      el.remove();
  }
}

// 프로그램 기능이 필요 없는 사이트 판단
function isInformationalPage() {
  const domain = location.hostname;
  const pathname = location.pathname;

  const publicDomains = [
    'go.kr', 'korea.kr', 'gouv.fr', 'gov.uk', 'who.int', 'un.org',
    'openai.com', 'chat.openai.com'
  ];

  const keywordPaths = ['/policy', '/static', '/notice', '/faq', '/help', '/support'];

  const isPublicDomain = publicDomains.some(d => domain.endsWith(d));
  const isStaticPath = keywordPaths.some(p => pathname.includes(p));
  const hasFormElements = !!document.querySelector('textarea, input, form');
  const hasUserContent = !!document.querySelector('[class*="comment"], [class*="reply"], [id*="user"]');

  // 판단 기준
  if (isPublicDomain || isStaticPath) return true; // 공공성 강함
  if (!hasFormElements && !hasUserContent) return true; // 상호작용 없음

  return false; // 사용자 개입 가능성 높음
}
