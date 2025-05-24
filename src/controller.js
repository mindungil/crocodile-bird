import {level_1, level_2, level_3} from './utils/prompts';

// content.js 로 부터 온 요청 관리
// clean 명령 뿐 아니라 다른 명령도 구현해야 함(예시 - remove 등)
chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
    if (msg.type == 'crocodile-bird-clean') {
        try {
            const cleaned = await cleanText(msg.text, msg.num);
            sendResponse({cleaned});
        } catch(err) {
            console.error(`clean Text 실패: ${err}`);
            sendResponse({cleaned: msg.text});
        }

        return true;
    }
});

// 서버로 메시지 보내기
async function cleanText(text, num) {
    try {
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
            'localhost:3000/api/cleanText',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'aaplication/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'user',
                            content: `${message}, 변경해야 할 텍스트: ${text}`
                        }
                    ],
                    num: num
                })
            }
        );

        return res;
    } catch(err) {
        console.error(err);
    }
}