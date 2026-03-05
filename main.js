// 다국어 데이터
const translations = {
    ko: {
        title: "누구 잘못?",
        headerTitle: "누구 잘못?",
        headerSubtitle: "Who's at Fault?",
        headerDescription: "친구, 연인 사이의 사소한 다툼, AI 판사가 명쾌하게 판결해드립니다!",
        labelPlaintiffName: "원고 이름",
        placeholderPlaintiffName: "예: 김철수",
        labelPlaintiffClaim: "원고의 주장",
        placeholderPlaintiffClaim: "예: 탕수육은 찍먹이 근본이다!",
        labelDefendantName: "피고 이름",
        placeholderDefendantName: "예: 이영희",
        labelDefendantClaim: "피고의 주장",
        placeholderDefendantClaim: "예: 소스를 부어야 고기에 잘 배어든다!",
        btnJudge: "엄숙하게 판결 내리기",
        loadingTexts: [
            "판사님이 판례를 뒤지는 중...",
            "엄숙하게 고민 중...",
            "망치를 닦으며 마음을 가다듬는 중...",
            "원고와 피고의 기싸움을 관찰 중..."
        ],
        winnerLabel: "승자",
        punishmentLabel: "형량/벌칙:",
        btnRestart: "다시 재판하기",
        btnShare: "판결문 공유하기",
        footerText: "© 2026 누구 잘못?. 모든 판결은 위트가 우선입니다.",
        alertInput: "원고와 피고의 주장을 모두 입력해주시옵소서.",
        shareTitle: "[누구 잘못? 판결문]",
        shareWinner: "승자",
        shareCrime: "죄목",
        shareContent: "내용",
        sharePunishment: "형량",
        copySuccess: "판결문이 복사되었습니다. 원하는 곳에 붙여넣으세요!"
    },
    en: {
        title: "Who's at Fault?",
        headerTitle: "Who's at Fault?",
        headerSubtitle: "A Petty Court",
        headerDescription: "Minor disputes between friends or couples? Let the AI Judge decide!",
        labelPlaintiffName: "Plaintiff Name",
        placeholderPlaintiffName: "e.g., John",
        labelPlaintiffClaim: "Plaintiff's Claim",
        placeholderPlaintiffClaim: "e.g., Dipping sauce is better!",
        labelDefendantName: "Defendant Name",
        placeholderDefendantName: "e.g., Jane",
        labelDefendantClaim: "Defendant's Claim",
        placeholderDefendantClaim: "e.g., Pouring sauce is better!",
        btnJudge: "Deliver Strict Judgment",
        loadingTexts: [
            "Judge is reviewing precedents...",
            "Deliberating solemnly...",
            "Polishing the gavel...",
            "Observing the tension between parties..."
        ],
        winnerLabel: "Winner",
        punishmentLabel: "Sentence/Penalty:",
        btnRestart: "Restart Trial",
        btnShare: "Share Verdict",
        footerText: "© 2026 Who's at Fault?. Wit comes first in all judgments.",
        alertInput: "Please enter both plaintiff and defendant claims.",
        shareTitle: "[Who's at Fault? Verdict]",
        shareWinner: "Winner",
        shareCrime: "Crime",
        shareContent: "Content",
        sharePunishment: "Penalty",
        copySuccess: "Verdict copied to clipboard. Paste it anywhere!"
    }
};

let currentLang = localStorage.getItem('lang') || 'ko';

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

// 언어 전환 버튼
const langBtns = {
    ko: document.getElementById('lang-ko'),
    en: document.getElementById('lang-en')
};

// UI 언어 업데이트 함수
function updateUI() {
    const t = translations[currentLang];
    
    document.getElementById('title').textContent = t.title;
    document.getElementById('header-title').textContent = t.headerTitle;
    document.getElementById('header-subtitle').textContent = t.headerSubtitle;
    document.getElementById('header-description').textContent = t.headerDescription;
    
    document.getElementById('label-plaintiff-name').textContent = t.labelPlaintiffName;
    plaintiffNameInput.placeholder = t.placeholderPlaintiffName;
    document.getElementById('label-plaintiff-claim').textContent = t.labelPlaintiffClaim;
    plaintiffInput.placeholder = t.placeholderPlaintiffClaim;
    
    document.getElementById('label-defendant-name').textContent = t.labelDefendantName;
    defendantNameInput.placeholder = t.placeholderDefendantName;
    document.getElementById('label-defendant-claim').textContent = t.labelDefendantClaim;
    defendantInput.placeholder = t.placeholderDefendantClaim;
    
    document.getElementById('btn-judge').textContent = t.btnJudge;
    document.getElementById('winner-label').textContent = t.winnerLabel;
    document.getElementById('punishment-label').textContent = t.punishmentLabel;
    
    restartBtn.textContent = t.btnRestart;
    shareBtn.textContent = t.btnShare;
    document.getElementById('footer-text').textContent = t.footerText;

    // 버튼 활성화 상태
    Object.keys(langBtns).forEach(lang => {
        langBtns[lang].classList.toggle('active', lang === currentLang);
    });
}

// 화면 전환 함수
function showScreen(screenId) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenId].classList.add('active');
}

// 판결 내리기 로직
async function startJudgment() {
    const t = translations[currentLang];
    const plaintiffName = plaintiffNameInput.value.trim() || (currentLang === 'ko' ? "원고" : "Plaintiff");
    const defendantName = defendantNameInput.value.trim() || (currentLang === 'ko' ? "피고" : "Defendant");
    const plaintiff = plaintiffInput.value.trim();
    const defendant = defendantInput.value.trim();

    if (!plaintiff || !defendant) {
        alert(t.alertInput);
        return;
    }

    // 로딩 화면 전환
    showScreen('loading');
    
    // 로딩 텍스트 랜덤 변경 효과
    const loadingTexts = t.loadingTexts;
    let textIdx = 0;
    loadingText.textContent = loadingTexts[0];
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
                defendantName,
                lang: currentLang
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
        alert("Error: " + error.message);
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
    const t = translations[currentLang];
    const text = `${t.shareTitle}\n\n${t.shareWinner}: ${winnerName.textContent}\n${t.shareCrime}: ${verdictTitle.textContent}\n${t.shareContent}: ${verdictText.textContent}\n${t.sharePunishment}: ${punishmentText.textContent}\n\n#WhosAtFault #AIJudge`;
    
    navigator.clipboard.writeText(text).then(() => {
        alert(t.copySuccess);
    }).catch(err => {
        console.error('Copy failed:', err);
    });
}

// 이벤트 리스너
judgeBtn.addEventListener('click', startJudgment);
restartBtn.addEventListener('click', resetApp);
shareBtn.addEventListener('click', shareVerdict);

langBtns.ko.addEventListener('click', () => {
    currentLang = 'ko';
    localStorage.setItem('lang', 'ko');
    updateUI();
});

langBtns.en.addEventListener('click', () => {
    currentLang = 'en';
    localStorage.setItem('lang', 'en');
    updateUI();
});

// 초기 실행
window.addEventListener('load', () => {
    updateUI();
    plaintiffNameInput.focus();
});
