import express from 'express'
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const app = express.Router();

app.post('/cleanText', async (req, res) => {
    try {
        const cleanText = await cleanText_gpt(req);
        return res.status(200).json(cleanText);
    } catch(err) {
        console.error(err);
        return res.status(500).json({error: 'Internal Server Error'});
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
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log(`Text 처리 성공`);
        return { cleaned: res.data.choices?.[0]?.message?.content?.trim() || null };
    } catch(err) {
        // 기본적인 예외 처리 -> 기본 텍스트 반환
          console.error('OpenAI 호출 실패:', {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data
        });
        return {cleaned: null};
    }
};

export default app;