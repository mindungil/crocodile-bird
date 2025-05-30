import express from 'express';
import api from './api.js';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api', api);

app.listen(3000, () => {
    console.log("server is running");
});