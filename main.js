// 다국어 데이터
const translations = {
    ko: {
        title: "누구 잘못?",
        headerTitle: "누구 잘못?",
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
        btnSaveImg: "이미지 저장",
        btnShareApi: "공유하기",
        btnCopyLink: "링크 복사",
        btnRestart: "다시 재판하기",
        footerText: "© 2026 누구 잘못?. 모든 판결은 위트가 우선입니다.",
        alertInput: "원고와 피고의 주장을 모두 입력해주시옵소서.",
        alertMinLength: "주장은 최소 10자 이상, 단어 2개 이상으로 구체적으로 입력해주셔야 판결이 가능합니다.",
        alertNameLength: "이름은 2자 이상 입력해주세요.",
        shareTitle: "[누구 잘못? 판결문]",
        shareWinner: "승자",
        shareCrime: "죄목",
        sharePunishment: "형량",
        copySuccess: "링크가 복사되었습니다!",
        saveSuccess: "이미지 저장을 시작합니다...",
        shareError: "공유 기능을 사용할 수 없는 환경입니다."
    },
    en: {
        title: "Who's at Fault?",
        headerTitle: "Who's at Fault?",
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
        btnSaveImg: "Save Image",
        btnShareApi: "Share",
        btnCopyLink: "Copy Link",
        btnRestart: "Restart Trial",
        footerText: "© 2026 Who's at Fault?. Wit comes first in all judgments.",
        alertInput: "Please enter both plaintiff and defendant claims.",
        alertMinLength: "Claims must be at least 10 characters long and contain at least 2 words.",
        alertNameLength: "Names must be at least 2 characters long.",
        shareTitle: "[Who's at Fault? Verdict]",
        shareWinner: "Winner",
        shareCrime: "Crime",
        sharePunishment: "Penalty",
        copySuccess: "Link copied to clipboard!",
        saveSuccess: "Saving image...",
        shareError: "Sharing is not supported in this browser."
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

const saveImgBtn = document.getElementById('save-img-btn');
const shareApiBtn = document.getElementById('share-api-btn');
const copyLinkBtn = document.getElementById('copy-link-btn');
const restartBtn = document.getElementById('restart-btn');

const langBtns = {
    ko: document.getElementById('lang-ko'),
    en: document.getElementById('lang-en')
};

function updateUI() {
    const t = translations[currentLang];
    document.getElementById('title').textContent = t.title;
    document.getElementById('header-title').textContent = t.headerTitle;
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
    document.getElementById('btn-save-img').textContent = t.btnSaveImg;
    document.getElementById('btn-share-api').textContent = t.btnShareApi;
    document.getElementById('btn-copy-link').textContent = t.btnCopyLink;
    restartBtn.textContent = t.btnRestart;
    document.getElementById('footer-text').textContent = t.footerText;
    Object.keys(langBtns).forEach(lang => {
        langBtns[lang].classList.toggle('active', lang === currentLang);
    });
}

function showScreen(screenId) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenId].classList.add('active');
}

async function startJudgment() {
    const t = translations[currentLang];
    const pName = plaintiffNameInput.value.trim() || (currentLang === 'ko' ? "원고" : "Plaintiff");
    const dName = defendantNameInput.value.trim() || (currentLang === 'ko' ? "피고" : "Defendant");
    const plaintiff = plaintiffInput.value.trim();
    const defendant = defendantInput.value.trim();

    // 입력값 검증
    if (!plaintiff || !defendant) {
        alert(t.alertInput);
        return;
    }

    if (pName.length < 2 || dName.length < 2) {
        alert(t.alertNameLength);
        return;
    }

    const wordCount = (str) => str.split(/\s+/).filter(w => w.length > 0).length;
    if (plaintiff.length < 10 || wordCount(plaintiff) < 2 || defendant.length < 10 || wordCount(defendant) < 2) {
        alert(t.alertMinLength);
        return;
    }

    showScreen('loading');
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plaintiff, defendant, plaintiffName: pName, defendantName: dName, lang: currentLang }),
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

function renderVerdict(data) {
    winnerName.textContent = data.winner;
    verdictTitle.textContent = `"${data.title}"`;
    verdictText.textContent = data.text;
    punishmentText.textContent = data.punishment;
}

function saveAsImage() {
    const t = translations[currentLang];
    const area = document.getElementById('capture-area');
    html2canvas(area, {
        backgroundColor: "#DFE0E2",
        scale: 2, // 고화질
        useCORS: true
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `verdict-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

function shareViaApi() {
    const t = translations[currentLang];
    const text = `${t.shareTitle}\n\n${t.shareWinner}: ${winnerName.textContent}\n${t.shareCrime}: ${verdictTitle.textContent}\n\n#WhosAtFault #AIJudge`;
    
    if (navigator.share) {
        navigator.share({
            title: t.title,
            text: text,
            url: window.location.href
        }).catch(console.error);
    } else {
        alert(t.shareError);
        copyToClipboard();
    }
}

function copyToClipboard() {
    const t = translations[currentLang];
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        alert(t.copySuccess);
    });
}

function resetApp() {
    plaintiffNameInput.value = "";
    defendantNameInput.value = "";
    plaintiffInput.value = "";
    defendantInput.value = "";
    showScreen('input');
}

judgeBtn.addEventListener('click', startJudgment);
restartBtn.addEventListener('click', resetApp);
saveImgBtn.addEventListener('click', saveAsImage);
shareApiBtn.addEventListener('click', shareViaApi);
copyLinkBtn.addEventListener('click', copyToClipboard);

langBtns.ko.addEventListener('click', () => { currentLang = 'ko'; localStorage.setItem('lang', 'ko'); updateUI(); });
langBtns.en.addEventListener('click', () => { currentLang = 'en'; localStorage.setItem('lang', 'en'); updateUI(); });

window.addEventListener('load', () => {
    updateUI();
    plaintiffNameInput.focus();
});
