import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggleBird');
  const stepContainer = document.getElementById('stepButtons');
  const stepButtons = document.querySelectorAll('.step-btn');

  // 초기 상태
  chrome.storage.local.get(['crocodileBirdOn', 'step'], data => {
    if(data.crocodileBirdOn === undefined) {
      chrome.storage.local.set({ crocodileBirdOn: false }, () => {
        console.log('기본값 crocodileBirdOn: "false" 설정됨');
      });
    }
     
    if(data.step === undefined) {
      // 초기값은 2단계 설정
      chrome.storage.local.set({ step: 2 }, () => {
        console.log('기본값 step: 2 단계로 설정');
      });
    }

    const step = data.step || 1;
    highlightSelected(step);
    updateUI(data.crocodileBirdOn);
  });

  function updateUI(crocodileBirdOn) {
    toggleBtn.textContent = crocodileBirdOn ? '악어새 해제' : '악어새 호출';
    stepContainer.style.display = crocodileBirdOn ? 'flex' : 'none';
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
        chrome.tabs.sendMessage(tabs[0].id, { type: "SET_STEP", step: selectedStep});
      });
    });
  });

  toggleBtn.addEventListener('click', () => {
  chrome.storage.local.get('crocodileBirdOn', data => {
    const newState = !data.crocodileBirdOn;

    chrome.storage.local.set({ crocodileBirdOn: newState }, () => {
      updateUI(newState);

      // 모든 탭에 메시지를 전송
      chrome.tabs.query({}, tabs => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_BIRD" }, res => {
            if (chrome.runtime.lastError) {
              console.warn(`탭 ${tab.id} - 메시지 실패: ${chrome.runtime.lastError.message}`);
            } else {
              console.log(`탭 ${tab.id} - 메시지 성공`);
            }
          });
        });
      });
    });
  });
});


  const apiKeyInput = document.getElementById('apiKeyInput');
  const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');

  chrome.storage.local.get(['apiKey'], data=> {
    if (data.apiKey) {
      apiKeyInput.value = data.apiKey;
    }
  });

  saveApiKeyBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (!key) {
      Toastify({
        text: "❗ API 키를 입력하세요.",
        duration: 2000,
        gravity: "top",
        position: "center",
        // backgroundColor: "#f44336", // 빨간색
    }).showToast();
      return;
    }

    chrome.storage.local.set({apiKey: key }, () => {
      Toastify({
        text: "✅ API 키가 저장되었습니다.",
        duration: 2000,
        gravity: "top",
        position: "center",
        // backgroundColor: "#3CAF50", 
    }).showToast();
    })
  })
});
