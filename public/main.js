import { translations } from './i18n.js';

let currentLang = localStorage.getItem('lang') || 'ko';

// 카카오 SDK 초기화 함수
function initKakao() {
    if (window.Kakao) {
        if (!window.Kakao.isInitialized()) {
            window.Kakao.init('7071c41242a1ef1686522e40cde9d873');
            console.log("Kakao SDK Initialized");
        }
    } else {
        // SDK가 아직 로드되지 않았을 경우를 대비해 약간의 지연 후 재시도
        setTimeout(initKakao, 500);
    }
}
initKakao();

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
const shareKakaoBtn = document.getElementById('share-kakao');
const shareFacebookBtn = document.getElementById('share-facebook');
const shareXBtn = document.getElementById('share-x');
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
    if (plaintiffNameInput) plaintiffNameInput.placeholder = t.placeholderPlaintiffName;
    document.getElementById('label-plaintiff-claim').textContent = t.labelPlaintiffClaim;
    if (plaintiffInput) plaintiffInput.placeholder = t.placeholderPlaintiffClaim;
    document.getElementById('label-defendant-name').textContent = t.labelDefendantName;
    if (defendantNameInput) defendantNameInput.placeholder = t.placeholderDefendantName;
    document.getElementById('label-defendant-claim').textContent = t.labelDefendantClaim;
    if (defendantInput) defendantInput.placeholder = t.placeholderDefendantClaim;
    document.getElementById('btn-judge').textContent = t.btnJudge;
    document.getElementById('winner-label').textContent = t.winnerLabel;
    document.getElementById('btn-save-img').textContent = t.btnSaveImg;
    document.getElementById('btn-copy-link').textContent = t.btnCopyLink;
    if (restartBtn) restartBtn.textContent = t.btnRestart;
    document.getElementById('footer-text').textContent = t.footerText;
    
    document.getElementById('extra-title').textContent = t.extraTitle;
    document.getElementById('extra-description').textContent = t.extraDescription;
    
    document.getElementById('link-about').textContent = t.linkAbout;
    document.getElementById('link-privacy').textContent = t.linkPrivacy;
    document.getElementById('link-terms').textContent = t.linkTerms;
    
    Object.keys(langBtns).forEach(lang => {
        if (langBtns[lang]) langBtns[lang].classList.toggle('active', lang === currentLang);
    });
}

function showScreen(screenId) {
    Object.values(screens).forEach(screen => {
        if (screen) screen.classList.remove('active');
    });
    if (screens[screenId]) screens[screenId].classList.add('active');
}

// 현재 표시 중인 판결 데이터를 객체로 추출
function getCurrentVerdictData() {
    return {
        winner: winnerName ? winnerName.textContent : "",
        title: verdictTitle ? verdictTitle.textContent.replace(/^"|"$/g, '') : "",
        text: verdictText ? verdictText.innerHTML.replace(/<br>/g, '\n') : "",
        punishment: punishmentText ? punishmentText.innerHTML.replace(/<br>/g, '\n') : ""
    };
}

// 서버에 판결 데이터를 저장하고 짧은 URL을 생성
async function createShareUrl() {
    const data = getCurrentVerdictData();
    try {
        const response = await fetch('/api/share', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error("Failed to save sharing data");
        const { id } = await response.json();
        const url = new URL(window.location.origin + window.location.pathname);
        url.searchParams.set('s', id); // 's'는 short ID 파라미터
        return url.toString();
    } catch (e) {
        console.error("Link shortening failed", e);
        return window.location.href; // 실패 시 기본 URL 반환
    }
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
    if (loadingText) loadingText.textContent = loadingTexts[0];
    const interval = setInterval(() => {
        textIdx = (textIdx + 1) % loadingTexts.length;
        if (loadingText) loadingText.textContent = loadingTexts[textIdx];
    }, 1000);

    try {
        const response = await fetch('/api/judge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plaintiff, defendant, plaintiffName: pName, defendantName: dName, lang: currentLang }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.error === "QUOTA_EXCEEDED") {
                clearInterval(interval);
                alert(t.alertQuotaExceeded);
                showScreen('input');
                return;
            }
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
    if (winnerName) winnerName.textContent = data.winner;
    if (verdictTitle) verdictTitle.textContent = `"${data.title}"`;
    // \n 및 리터럴 \n 문자열을 <br> 태그로 변환하여 innerHTML로 삽입
    if (verdictText) verdictText.innerHTML = (data.text || '').replace(/\\n/g, '\n').replace(/\n/g, '<br>');
    if (punishmentText) punishmentText.innerHTML = (data.punishment || '').replace(/\\n/g, '\n').replace(/\n/g, '<br>');
}

function saveAsImage() {
    const area = document.getElementById('capture-area');
    if (!area) return;
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

// 소셜 공유 함수들
async function shareKakao() {
    const t = translations[currentLang];
    const data = getCurrentVerdictData();
    const shareUrl = await createShareUrl();
    
    if (window.Kakao && window.Kakao.isInitialized()) {
        try {
            window.Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: `[누구 잘못?] ${data.winner} 승!`,
                    description: `죄목: ${data.title}\n판결: ${data.punishment.substring(0, 50)}...`,
                    imageUrl: window.location.origin + '/1.png',
                    link: {
                        mobileWebUrl: shareUrl,
                        webUrl: shareUrl,
                    },
                },
                social: {
                    likeCount: Math.floor(Math.random() * 100) + 1,
                    commentCount: Math.floor(Math.random() * 50) + 1,
                    sharedCount: Math.floor(Math.random() * 200) + 1,
                },
                buttons: [
                    {
                        title: '판결 결과 보기',
                        link: {
                            mobileWebUrl: shareUrl,
                            webUrl: shareUrl,
                        },
                    },
                ],
            });
        } catch (e) {
            console.error("Kakao Share Error:", e);
            alert("카카오톡 공유 중 오류가 발생했습니다.");
        }
    } else {
        alert("카카오톡 공유 기능을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.");
        initKakao();
    }
}

async function shareFacebook() {
    const shareUrl = await createShareUrl();
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
}

async function shareX() {
    const t = translations[currentLang];
    const data = getCurrentVerdictData();
    const shareUrl = await createShareUrl();
    const text = `${t.shareTitle}\n승자: ${data.winner}\n죄목: ${data.title}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
}

async function copyToClipboard() {
    const t = translations[currentLang];
    const shareUrl = await createShareUrl();
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert(t.copySuccess);
        }).catch(err => {
            console.error('Clipboard error:', err);
            // 대체 방법 (iOS 등 지원 안되는 경우)
            const textArea = document.createElement("textarea");
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert(t.copySuccess);
        });
    }
}

function resetApp() {
    const url = new URL(window.location.origin + window.location.pathname);
    window.history.replaceState({}, '', url);
    if (plaintiffNameInput) plaintiffNameInput.value = "";
    if (defendantNameInput) defendantNameInput.value = "";
    if (plaintiffInput) plaintiffInput.value = "";
    if (defendantInput) defendantInput.value = "";
    showScreen('input');
}

// URL 파라미터에 짧은 ID가 있는지 확인하여 판결문 불러오기
async function checkSharedVerdict() {
    const urlParams = new URLSearchParams(window.location.search);
    const shortId = urlParams.get('s');
    if (shortId) {
        try {
            const response = await fetch(`/api/share?id=${shortId}`);
            if (response.ok) {
                const data = await response.json();
                renderVerdict(data);
                showScreen('result');
                return true;
            }
        } catch (e) {
            console.error("Loading shared verdict failed", e);
        }
    }
    return false;
}

// 이벤트 리스너 등록
if (judgeBtn) judgeBtn.addEventListener('click', startJudgment);
if (restartBtn) restartBtn.addEventListener('click', resetApp);
if (saveImgBtn) saveImgBtn.addEventListener('click', saveAsImage);

// 소셜 공유 이벤트 리스너
if (shareKakaoBtn) shareKakaoBtn.addEventListener('click', shareKakao);
if (shareFacebookBtn) shareFacebookBtn.addEventListener('click', shareFacebook);
if (shareXBtn) shareXBtn.addEventListener('click', shareX);

if (copyLinkBtn) copyLinkBtn.addEventListener('click', copyToClipboard);

if (langBtns.ko) langBtns.ko.addEventListener('click', () => { currentLang = 'ko'; localStorage.setItem('lang', 'ko'); updateUI(); });
if (langBtns.en) langBtns.en.addEventListener('click', () => { currentLang = 'en'; localStorage.setItem('lang', 'en'); updateUI(); });

window.addEventListener('load', () => {
    updateUI();
    checkSharedVerdict().then(isShared => {
        if (!isShared && plaintiffNameInput) {
            plaintiffNameInput.focus();
        }
    });
});
