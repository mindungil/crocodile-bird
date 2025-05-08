// 웹 페이지 내의 텍스트 노드를 모두 탐색, 순회, 응답 텍스트로 대체
function walkTextNodes() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];

    // 텍스트 노드를 하나씩 순회, 유효한 텍스트만 저장
    // TreeWalker은 DOM 트리 구조를 순회
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.nodeValue.trim()) {
        nodes.push(node);
      }
    }

    // 오버레이 삽입( 대기시간 )
    showOverlay();

    // 노드 순회 -> controller로 요청 보내서 텍스트 변경
    const promises = nodes.map(node => {
      return new Promise(resolve => {
        chrome.runtime.sendMessage({ type: 'CLEAN', text: node.nodeValue }, res => {
          if (res?.cleaned) node.nodeValue = res.cleaned;
          resolve();
        });
      });
    });

    Promise.all(promises)
    .then(() => {
      removeOverlay();
      console.log(`${nodes.length}건의 순화 완료`);
    });
}

// 다크모드 적용 필요(추후에)
function showOverlay() {
    const el = document.createElement('div');
    el.id = 'crocodile-bird--overlay';
  
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
    }, 400); // 0.3초 간격으로 전환
  
    // 오버레이 제거 시 interval 해제도 필요하므로 저장
    el.dataset.intervalId = intervalId;
  
    // 조립
    el.appendChild(img);
    el.appendChild(text);
    document.body.appendChild(el);
  }
  
function removeOverlay() {
    const el = document.getElementById('crocodile-bird-overlay');
    if (el) {
        // 동작도 제거해야함
        clearInterval(el.dataset.intervalId);
        el.remove();
    }
}

walkTextNodes();