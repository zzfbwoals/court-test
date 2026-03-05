// 로딩 텍스트
const loadingTexts = [
    "판사님이 판례를 뒤지는 중...",
    "엄숙하게 고민 중...",
    "망치를 닦으며 마음을 가다듬는 중...",
    "원고와 피고의 기싸움을 관찰 중..."
];

// DOM 요소
const screens = {
    input: document.getElementById('input-screen'),
    loading: document.getElementById('loading-screen'),
    result: document.getElementById('result-screen')
};

const plaintiffNameInput = document.getElementById('plaintiff-name');
const defendantNameInput = document.getElementById('defendant-name');
const plaintiffInput = document.getElementById('plaintiff');
const defendantInput = document.getElementById('defendant');
const judgeBtn = document.getElementById('judge-btn');
const loadingText = document.getElementById('loading-text');

const winnerName = document.getElementById('winner-name');
const verdictTitle = document.getElementById('verdict-title');
const verdictText = document.getElementById('verdict-text');
const punishmentText = document.getElementById('punishment-text');

const restartBtn = document.getElementById('restart-btn');
const shareBtn = document.getElementById('share-btn');

// 화면 전환 함수
function showScreen(screenId) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenId].classList.add('active');
}

// 판결 내리기 로직
async function startJudgment() {
    const plaintiffName = plaintiffNameInput.value.trim() || "원고";
    const defendantName = defendantNameInput.value.trim() || "피고";
    const plaintiff = plaintiffInput.value.trim();
    const defendant = defendantInput.value.trim();

    if (!plaintiff || !defendant) {
        alert("원고와 피고의 주장을 모두 입력해주시옵소서.");
        return;
    }

    // 로딩 화면 전환
    showScreen('loading');
    
    // 로딩 텍스트 랜덤 변경 효과
    let textIdx = 0;
    const interval = setInterval(() => {
        textIdx = (textIdx + 1) % loadingTexts.length;
        loadingText.textContent = loadingTexts[textIdx];
    }, 1000);

    try {
        const response = await fetch('/api/judge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                plaintiff, 
                defendant, 
                plaintiffName, 
                defendantName 
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'API call failed');
        }

        const data = await response.json();
        
        clearInterval(interval);
        renderVerdict(data);
        showScreen('result');
    } catch (error) {
        console.error('Judgment Error:', error);
        clearInterval(interval);
        alert("재판 진행 중 예기치 못한 오류가 발생했습니다: " + error.message);
        showScreen('input');
    }
}

// 판결 결과 렌더링
function renderVerdict(data) {
    winnerName.textContent = data.winner;
    verdictTitle.textContent = `"${data.title}"`;
    verdictText.textContent = data.text;
    punishmentText.textContent = data.punishment;
}

// 초기화 함수
function resetApp() {
    plaintiffNameInput.value = "";
    defendantNameInput.value = "";
    plaintiffInput.value = "";
    defendantInput.value = "";
    showScreen('input');
}

// 공유 기능 (텍스트 복사)
function shareVerdict() {
    const text = `🏛️ [누구 잘못? 판결문] 🏛️\n\n승자: ${winnerName.textContent}\n죄목: ${verdictTitle.textContent}\n내용: ${verdictText.textContent}\n형량: ${punishmentText.textContent}\n\n#누구잘못 #AI판사 #커플싸움`;
    
    navigator.clipboard.writeText(text).then(() => {
        alert("판결문이 복사되었습니다. 원하는 곳에 붙여넣으세요!");
    }).catch(err => {
        console.error('복사 실패:', err);
    });
}

// 이벤트 리스너
judgeBtn.addEventListener('click', startJudgment);
restartBtn.addEventListener('click', resetApp);
shareBtn.addEventListener('click', shareVerdict);

// 텍스트 영역 자동 포커스 효과 (선택사항)
window.addEventListener('load', () => {
    plaintiffNameInput.focus();
});
