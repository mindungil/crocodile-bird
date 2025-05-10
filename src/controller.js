import axios from 'axios';
import prompts from './utils/prompts';

// content.js 로 부터 온 요청 관리
// clean 명령 뿐 아니라 다른 명령도 구현해야 함(예시 - remove 등)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type == 'crocodile-bird-clean') {
        cleanText(msg.text, msg.num)
        .then(cleaned => {
            sendResponse({cleaned});
        });
        return true;
    }
});

// api 요청으로 text 순화처리
async function cleanText(text, num) {
    try {
        // num 번호에 따라 API 요청에 보내는 프롬프트 변경
        let message;
        if (num == 1) message = prompts.level_1;
        else if (num == 2) message = prompts.level_2;
        else if (num == 3) message = prompts.level_3;
        else {
            console.log('프롬프트 번호 수신 오류');
            // 프롬프트 번호 수신 오류 발생 시 최악의 상황을 방지하여 가장 높은 수준 적용
            message = prompts.level_3;
        }

        const apiKey = process.env.OPENAI_API_KEY;
        const res = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4.0',
                messages: [{ 
                    role: 'user', 
                    // 프롬프트의 내용을 단계에 따라 구분 -> 프롬프트를 구분
                    content: `${message}    변경해야 할 텍스트: ${text}`}]
            },
            {
                headers: {
                    Authorization: `Bearer sk-${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log(`Text 처리 성공`);
        return res.data.choices?.[0]?.message?.content?.trim() || text;
    } catch {
        console.log(`API 호출 실패`);
        return text;
    }
}

