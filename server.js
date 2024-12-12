const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 점수 저장 파일 경로
const SCORE_FILE = path.join(__dirname, 'data', 'scores.json');

// 최초 실행 시 scores.json 이 없으면 빈 배열 생성
if (!fs.existsSync(SCORE_FILE)) {
    fs.writeFileSync(SCORE_FILE, JSON.stringify([]), 'utf8');
}

// 점수 리스트 불러오기
app.get('/scores', (req, res) => {
    fs.readFile(SCORE_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Server Error');
        const scores = JSON.parse(data);
        // 상위 10개 정렬 후 반환
        scores.sort((a,b) => b.score - a.score);
        res.json(scores.slice(0,10));
    });
});

// 점수 저장하기
app.post('/scores', (req, res) => {
    const { name, score } = req.body;
    if (typeof name !== 'string' || typeof score !== 'number') {
        return res.status(400).send('Invalid data');
    }

    fs.readFile(SCORE_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Server Error');
        const scores = JSON.parse(data);
        scores.push({ name, score });
        fs.writeFile(SCORE_FILE, JSON.stringify(scores), 'utf8', err => {
            if (err) return res.status(500).send('Server Error');
            res.json({ success: true });
        });
    });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
