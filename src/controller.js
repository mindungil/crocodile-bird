import axios from 'axios';

// content.js 로 부터 온 요청 관리
// CLEAN 명령 뿐 아니라 다른 명령도 구현해야 함(예시 - remove 등)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type == 'CLEAN') {
        cleanText(msg.text)
        .then(cleaned => {
            sendResponse({cleaned});
        });
        return true;
    }
});

async function cleanText(text) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        const res = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4.0',
                messages: [{ 
                    role: 'user', 
                    content: `(프롬프트): ${text}`}]
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

