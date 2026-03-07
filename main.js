import { translations } from './i18n.js';

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
    
    document.getElementById('extra-title').textContent = t.extraTitle;
    document.getElementById('extra-description').textContent = t.extraDescription;
    
    document.getElementById('link-about').textContent = t.linkAbout;
    document.getElementById('link-privacy').textContent = t.linkPrivacy;
    document.getElementById('link-terms').textContent = t.linkTerms;
    
    Object.keys(langBtns).forEach(lang => {
        langBtns[lang].classList.toggle('active', lang === currentLang);
    });
}

function showScreen(screenId) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenId].classList.add('active');
}

// 판결 데이터를 URL용 Base64로 인코딩
function encodeVerdict(data) {
    try {
        const str = JSON.stringify(data);
        return btoa(encodeURIComponent(str));
    } catch (e) {
        console.error("Encoding failed", e);
        return null;
    }
}

// URL용 Base64를 판결 데이터로 디코딩
function decodeVerdict(encoded) {
    try {
        const str = decodeURIComponent(atob(encoded));
        return JSON.parse(str);
    } catch (e) {
        console.error("Decoding failed", e);
        return null;
    }
}

// 공유용 URL 생성
function getShareUrl(data) {
    const encoded = encodeVerdict(data);
    const url = new URL(window.location.origin + window.location.pathname);
    if (encoded) url.searchParams.set('v', encoded);
    return url.toString();
}

// 현재 표시 중인 판결 데이터를 객체로 추출
function getCurrentVerdictData() {
    return {
        winner: winnerName.textContent,
        title: verdictTitle.textContent.replace(/^"|"$/g, ''),
        text: verdictText.innerHTML.replace(/<br>/g, '\n'),
        punishment: punishmentText.innerHTML.replace(/<br>/g, '\n')
    };
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
    // \n 및 리터럴 \n 문자열을 <br> 태그로 변환하여 innerHTML로 삽입
    verdictText.innerHTML = (data.text || '').replace(/\\n/g, '\n').replace(/\n/g, '<br>');
    punishmentText.innerHTML = (data.punishment || '').replace(/\\n/g, '\n').replace(/\n/g, '<br>');
}

function saveAsImage() {
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
    const data = getCurrentVerdictData();
    const shareUrl = getShareUrl(data);
    const text = `${t.shareTitle}\n\n${t.shareWinner}: ${data.winner}\n${t.shareCrime}: ${data.title}\n\n${t.sharePunishment}: ${data.punishment}\n\n판결 확인하기:\n${shareUrl}\n\n#WhosAtFault #AIJudge`;
    
    if (navigator.share) {
        navigator.share({
            title: t.title,
            text: text,
            url: shareUrl
        }).catch(console.error);
    } else {
        copyToClipboard(shareUrl);
    }
}

function copyToClipboard(customUrl) {
    const t = translations[currentLang];
    const data = getCurrentVerdictData();
    const shareUrl = customUrl || getShareUrl(data);
    
    const textToCopy = `${t.shareTitle}\n\n${t.shareWinner}: ${data.winner}\n${t.shareCrime}: ${data.title}\n\n${t.sharePunishment}: ${data.punishment}\n\n판결 확인하기: ${shareUrl}`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert(t.copySuccess);
    });
}

function resetApp() {
    // URL 파라미터 제거하여 초기 화면으로
    const url = new URL(window.location.origin + window.location.pathname);
    window.history.replaceState({}, '', url);
    
    plaintiffNameInput.value = "";
    defendantNameInput.value = "";
    plaintiffInput.value = "";
    defendantInput.value = "";
    showScreen('input');
}

// URL 파라미터에 판결 데이터가 있는지 확인
function checkSharedVerdict() {
    const urlParams = new URLSearchParams(window.location.search);
    const encoded = urlParams.get('v');
    if (encoded) {
        const data = decodeVerdict(encoded);
        if (data) {
            renderVerdict(data);
            showScreen('result');
            return true;
        }
    }
    return false;
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
    // 공유된 판결문이 있다면 표시, 없으면 입력창 포커스
    if (!checkSharedVerdict()) {
        plaintiffNameInput.focus();
    }
});
