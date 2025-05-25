chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TOGGLE_BIRD_OFF") {
    window.crocodileBirdActive = false;
    removeOverlay();
    console.log("악어새 기능 중단");

    return;
  }
  // 스텝을 변경할 때, 실행 할 수 없는 경우 일 수 도 있음.
  // 스텝 변경 후 실행, 스텝 변경 해도 실행하지 않음 -> 고려해야함
  else if (message.type === "SET_STEP"){
    window.crocodileBirdStep = message.step;
    console.log(`${message.step} 단계로 설정`);
  }

  console.log(`악어새 봇이 ${message.step}단계로 돌아가는 중 입니다....`);
  window.crocodileBirdActive = true;
  chrome.storage.local.get('step', data => {
    window.crocodileBirdStep = data.step || 1;
    walkTextNodes();
  });
});

// 웹 페이지 내의 텍스트 노드를 모두 탐색, 순회, 응답 텍스트로 대체
function walkTextNodes() {
  // 함수 시작 로그
  console.log('[Content] content.js loaded');

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];

  window.crocodileBirdActive = window.crocodileBirdActive || false;
  window.crocodileBirdStep = window.crocodileBirdStep || 1;

  // 텍스트 노드를 하나씩 순회, 유효한 텍스트만 저장
  // TreeWalker은 DOM 트리 구조를 순회
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.nodeValue.trim()) {
      nodes.push(node);
    }
    console.log(`text 추출 중: ${node.nodeValue}`);
  }

  // 오버레이 삽입( 대기시간 )
  showOverlay();

  // 노드 순회 -> controller로 요청 보내서 텍스트 변경
  // 메시지 전송 함수 따로 분리
  function sendCleanRequest(text) {
    return new Promise(resolve => {
      chrome.runtime.sendMessage({ type: 'crocodile-bird-clean', text }, res => {
        resolve(res?.cleaned || null);
      });
    });
  }

  // 비동기 순화 처리
  async function cleanNodes(nodes) {
    for (const node of nodes) {
      const cleaned = await sendCleanRequest(node.nodeValue);
      if (cleaned) {
        node.nodeValue = cleaned;
        console.log('순화된 노드:', node.nodeValue);
      } else {
        console.log('node가 비어있거나 API 응답 없음');
      }
    }

    removeOverlay();
    console.log(`총 ${nodes.length}건의 순화 완료`);
  }

  // 순화 처리 - 오버레이 제거까지
  cleanNodes(nodes);
}

// 오버레이 설정 및 제거
// 다크모드 적용 필요(추후에)
function showOverlay() {
    const el = document.createElement('div');
    el.id = 'crocodile-bird-overlay';
  
    // 이미지 엘리먼트 생성
    const img = document.createElement('img');
    img.style.width = '32px';
    img.style.height = '32px';
    img.style.marginRight = '8px';
  
    const frames = [
      chrome.runtime.getURL('icons/loading1.png'),
      chrome.runtime.getURL('icons/loading2.png'),
      chrome.runtime.getURL('icons/loading3.png'),
      chrome.runtime.getURL('icons/loading4.png'),
      chrome.runtime.getURL('icons/loading5.png')
    ];
    let currentFrame = 0;

    const loadingText = document.createElement('span');
    loadingText.textContent = '악어새가 페이지를 검사하는 중입니다';
  
    // 오버레이 스타일
    Object.assign(el.style, {
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#000',
      color: '#fff',
      padding: '10px 14px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      zIndex: 99999
    });

    // 애니메이션 루프
    const intervalId = setInterval(() => {
      img.src = frames[currentFrame];
      currentFrame = (currentFrame + 1) % frames.length;
    }, 400);
  
    // 오버레이 제거 시 interval 해제도 필요하므로 저장
    el.dataset.intervalId = intervalId;
  
    // 조립
    el.appendChild(img);
    el.appendChild(text);
    document.body.appendChild(el);
  }
function removeOverlay() {
    const el = document.getElementById('crocodile-bird-overlay');

    // el 오버레이의 NULL 제거 방지
    if (el) {
        // 동작도 제거해야함
        const id = parseInt(el.dataset.intervalId);
        clearInterval(el.dataset.intervalId);
        el.remove();
    }
}