document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggleBird');
  const stepContainer = document.getElementById('stepButtons');
  const stepButtons = document.querySelectorAll('.step-btn');

  // 초기 상태
  chrome.storage.local.get(['isActive', 'step'], data => {
    const step = data.step || 1;
    highlightSelected(step);
    updateUI(data.isActive);
  });

  function updateUI(isActive) {
    toggleBtn.textContent = isActive ? '악어새 해제' : '악어새 호출';
    stepContainer.style.display = isActive ? 'flex' : 'none';
  }

  function highlightSelected(step) {
    stepButtons.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.step) === step);
    });
  }

  stepButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedStep = parseInt(btn.dataset.step);
      chrome.storage.local.set({ step: selectedStep });
      highlightSelected(selectedStep);

      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        // 단계를 메시지로 전달
        chrome.tabs.sendMessage(taps[0].id, { type: "SET_STEP", step: selectedStep});
      });
    });
  });

  toggleBtn.addEventListener('click', () => {
    chrome.storage.local.get('isActive', data => {
      const newState = !data.isActive;
      chrome.storage.local.set({ isActive: newState }, () => {
        updateUI(newState);
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
          // 메시지를 통해 페이지 전환 후에도 자동 적용
          chrome.tabs.sendMessage(taps[0].id, { type: "TOGGLE_BIRD"});
        });
      });
    });
  });
});
