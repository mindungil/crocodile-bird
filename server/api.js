import express from 'express'
import axios from 'axios';

const app = express.Router();

app.post('/cleanText', async (req, res) => {
    try {
        const cleanText = await cleanText_gpt(req);
        res.status(200).json(cleanText);
    } catch(err) {
        console.error(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

async function cleanText_gpt(msg) {
    try {
        const { model, messages } = msg.body;
        const res = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model,
                messages
            },
            {
                header: {
                    Authorization: `Bearer: ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

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

export default app;