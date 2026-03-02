// 데모 모드용 랜덤 판결 데이터
const demoVerdicts = [
    {
        title: "고기 주권 침해죄",
        text: "본 판사는 탕수육의 본질이 바삭함에 있음을 엄중히 선포한다. 피고가 소스를 부어 고기의 고유한 식감을 훼손한 행위는 명백한 월권이며, 원고의 입맛을 기만한 죄가 크다. 이에 원고의 손을 들어준다.",
        punishment: "다음 식사 때 찍먹파에게 사죄의 의미로 군만두 추가 서비스하기"
    },
    {
        title: "치킨 다리 독점 미수죄",
        text: "한 마리의 치킨에는 두 개의 다리가 있음이 자명하거늘, 이를 혼자 독식하려 한 피고의 탐욕은 법정의 이름으로 용납될 수 없다. 공정한 분배는 평화로운 야식 문화를 위해 필수적인 가치임을 명심하라.",
        punishment: "일주일간 치킨 주문 시 콜라 따르기 전담 요원으로 임명"
    },
    {
        title: "답장 지연 방치죄",
        text: "읽음 표시가 떴음에도 3시간 동안 답변을 하지 않은 피고의 행태는 원고의 심장에 심각한 정서적 가뭄을 초래하였다. 바쁘다는 핑계는 법정에서 통하지 않으며, 성의 있는 답장은 관계의 기본 의무임을 선고한다.",
        punishment: "원고가 지정한 이모티콘 10회 연속 사용하며 애교 섞인 답장하기"
    }
];

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

    // 실제로는 여기에 AI API 호출 로직이 들어감
    // 현재는 데모 모드로 작동 (2.5초 대기)
    setTimeout(() => {
        clearInterval(interval);
        renderVerdict(plaintiff, defendant);
        showScreen('result');
    }, 2500);
}

// 판결 결과 렌더링 (데모 모드)
function renderVerdict(plaintiff, defendant) {
    const randomVerdict = demoVerdicts[Math.floor(Math.random() * demoVerdicts.length)];
    const winner = Math.random() > 0.5 ? "원고" : "피고";

    winnerName.textContent = winner;
    verdictTitle.textContent = `"${randomVerdict.title}"`;
    verdictText.textContent = randomVerdict.text;
    punishmentText.textContent = randomVerdict.punishment;
}

// 초기화 함수
function resetApp() {
    plaintiffInput.value = "";
    defendantInput.value = "";
    showScreen('input');
}

// 공유 기능 (텍스트 복사)
function shareVerdict() {
    const text = `🏛️ [소소한 재판소 판결문] 🏛️\n\n승자: ${winnerName.textContent}\n죄목: ${verdictTitle.textContent}\n내용: ${verdictText.textContent}\n형량: ${punishmentText.textContent}\n\n#소소한재판소 #AI판사 #커플싸움`;
    
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
    plaintiffInput.focus();
});
