import {level_1, level_2, level_3} from './utils/prompts';

// content.js 로 부터 온 요청 관리
// clean 명령 뿐 아니라 다른 명령도 구현해야 함(예시 - remove 등)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type == 'crocodile-bird-clean') {
        chrome.storage.local.get(['apiKey'], async (result) => {
            const apiKey = result.apiKey;
            if (!apiKey) {
                // 실패 시 원본 반환: api key 미설정
                console.error('API key가 설정되지 않았습니다');
                sendResponse({cleaned: msg.text});
                return;
            }

            try {
                const cleaned = await cleanText(msg.text, msg.num || 3, apiKey);
                sendResponse({cleaned});
            } catch(err) {
                console.error(`clean Text 실패: ${err}`);
                sendResponse({cleaned: msg.text});
            }

        }); 
        return true;
    }
});

// api 요청으로 text 순화처리
async function cleanText(text, num, apiKey) {
    try {
        // num 번호에 따라 API 요청에 보내는 프롬프트 변경
        let message;
        if (num == 1) message = level_1;
        else if (num == 2) message = level_2;
        else if (num == 3) message = level_3;
        else {
            console.log('프롬프트 번호 수신 오류');
            // 프롬프트 번호 수신 오류 발생 시 최악의 상황을 방지하여 가장 높은 수준 적용
            message = prompts.level_3;
        }

        const res = await fetch(
            'https://api.openai.com/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'user',
                            content: `${message},    변경해야 할 텍스트: ${text}`
                        }
                    ]
                })
        });

        if (!res.ok) {
            throw new Error("HTTP 에러, status: ", res.status);
        }
        console.log(`Text 처리 성공`);
        return res.data.choices?.[0]?.message?.content?.trim() || text;
    } catch(err) {
        // 기본적인 예외 처리 -> 기본 텍스트 반환
        console.error(`API 호출 실패: `, err);
        return text;
    }
};