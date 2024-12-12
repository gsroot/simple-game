const API_BASE_URL = 'http://localhost:3000';

// 서버와 통신하는 함수들

async function getScores() {
    const res = await fetch(`${API_BASE_URL}/scores`);
    return await res.json();
}

async function postScore(name, score) {
    const res = await fetch(`${API_BASE_URL}/scores`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name, score })
    });
    return await res.json();
}
