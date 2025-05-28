import {level_1, level_2, level_3} from './utils/prompts';

// content.js 로 부터 온 요청 관리
// clean 명령 뿐 아니라 다른 명령도 구현해야 함(예시 - remove 등)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type == 'crocodile-bird-clean') {

        (async () => {
            try {
                console.log('서버와의 통신 시작');
                const cleaned = await cleanText(msg.text, msg.num);
                sendResponse({cleaned});
            } catch(err) {
                console.error(`clean Text 실패: ${err}`);
                sendResponse({cleaned: msg.text});
            }
        })();

        return true;
    }
});

// 서버로 메시지 보내기
async function cleanText(text, num) {
    try {
        let message;
        if(num == 1) message = level_1;
        else if (num == 2) message = level_2;
        else if (num == 3) message = level_3;
        else {
            console.log('프롬프트 번호 수신 오류');
            // 프롬프트 번호 수신 오류 발생 시 최악의 상황을 방지하여 가장 높은 수준 적용
            message = prompts.level_3;
        }
        console.log(`message 프롬프트: ${message}`);


        const res = await fetch(
            'http://localhost:3000/api/cleanText',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: message
                        },
                        {
                            role: 'user',
                            content: text
                        }
                    ],
                    num: num
                })
            }
        );
        if (!res.ok) {
            throw new Error(`서버 응답 실패: ${res.status}`);
        }

        const data = await res.json();
        console.log('서버 응답 데이터:', data);
        return data.cleaned;
    } catch(err) {
        console.error(err);
        return text;
    }
}