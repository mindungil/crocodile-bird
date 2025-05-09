import axios from 'axios';

// content.js 로 부터 온 요청 관리
// CLEAN 명령 뿐 아니라 다른 명령도 구현해야 함(예시 - remove 등)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type == 'CLEAN') {
        cleanText(msg.text, msg.num)
        .then(cleaned => {
            sendResponse({cleaned});
        });
        return true;
    }
});

async function cleanText(text, num) {
    try {
        // num 번호에 따라 API 요청에 보내는 프롬프트 변경
        let message;
        if (num == 0) message = '';
        else if (num == 1) message = '';
        else message = '';

        const apiKey = process.env.OPENAI_API_KEY;
        const res = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4.0',
                messages: [{ 
                    role: 'user', 
                    // 프롬프트의 내용을 단계에 따라 구분 -> 프롬프트를 구분
                    content: `${mesage}: ${text}`}]
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

