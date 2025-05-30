// DOM 트리가 완성되었을 때 실행 -> 한 번만 실행됨
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggleBird');
  const stepContainer = document.getElementById('stepButtons');
  const stepButtons = document.querySelectorAll('.step-btn');

  // 초기 상태
  chrome.storage.local.get(['crocodileBirdOn', 'crocodileBirdStep'], data => {
    if(data.crocodileBirdOn === undefined) {
      chrome.storage.local.set({ crocodileBirdOn: false }, () => {
        console.log('기본값 crocodileBirdOn: "false" 설정됨');
      });
    }
     
    if(data.crocodileBirdStep === undefined) {
      // 초기값은 3단계 설정
      chrome.storage.local.set({ crocodileBirdStep: 2 }, () => {
        console.log('기본값 step: high_level 단계로 설정');
      });
    }

    const step = data.crocodileBirdStep || 2;
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

  // content.js가 주입된 모든 tab에 메시지 전달 -> 작동 유도
  stepButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedStep = parseInt(btn.dataset.step);
      chrome.storage.local.set({ step: selectedStep });
      highlightSelected(selectedStep);

      chrome.tabs.query({}, tabs => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, { type: "SET_STEP", step: selectedStep }, response => {
            if (chrome.runtime.lastError) {
              return;
            }
          })
        })
      }
      );
    });
  });

  // 악어새 호출 및 해제 버튼
  toggleBtn.addEventListener('click', () => {
    chrome.storage.local.get('crocodileBirdOn', data => {
      const newState = !data.crocodileBirdOn;

      chrome.storage.local.set({ crocodileBirdOn: newState }, () => {
        updateUI(newState);
        
        // 악어새 호출인 경우
        if(newState == true) {
          chrome.tabs.query({}, tabs => {
            tabs.forEach(tab => {
              chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_BIRD_ON" }, res => {
                if (chrome.runtime.lastError) {
                  console.log('content.js가 주입되지 않은 탭');
                  return;
                } else {
                  console.log(`탭 ${tab.id} - 메시지 성공`);
                }
                });
              }
            );
          });
        }
        // 악어새 해제인 경우
        else {
          // 모든 탭에 호출 및 해제 메시지를 전송
          chrome.tabs.query({}, tabs => {
            tabs.forEach(tab => {
              chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_BIRD_OFF" }, res => {
                if (chrome.runtime.lastError) {
                  console.log('content.js가 주입되지 않은 탭');
                  return;
                } else {
                  console.log(`탭 ${tab.id} - 메시지 성공`);
                }
                });
              }
            );
          });
        }
      });
    });
  } 
);
});
