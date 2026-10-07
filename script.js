// ==========================================
// Oh Hyunbin Toss-style Intro Page Logic
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHungerCard();
  initFilterChips();
  initMiniPlayer();
  initTreatModal();
  initCopyAndGreetings();
});

/* ------------------------------------------
   1. 테마 토글 (라이트 / 다크)
------------------------------------------ */
function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const icon = themeToggleBtn.querySelector('i');
  
  // 저장된 테마 불러오기 또는 시스템 기본값
  const savedTheme = localStorage.getItem('hb_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    icon.classList.replace('fa-moon', 'fa-sun');
  }

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('hb_theme', newTheme);

    if (newTheme === 'dark') {
      icon.classList.replace('fa-moon', 'fa-sun');
      showToast('다크 모드로 전환되었습니다 🌙');
    } else {
      icon.classList.replace('fa-sun', 'fa-moon');
      showToast('라이트 모드로 전환되었습니다 ☀️');
    }
  });
}

/* ------------------------------------------
   2. 삼겹살 & 비빔면 응원 인터랙션 (1인 1회 제한)
------------------------------------------ */
function initHungerCard() {
  const cheerBtn = document.getElementById('cheerBtn');
  const cheerCount = document.getElementById('cheerCount');
  const hungerValue = document.getElementById('hungerValue');
  const gaugeBarFill = document.getElementById('gaugeBarFill');

  let count = parseInt(cheerCount.textContent, 10) || 128;
  let hasCheered = localStorage.getItem('hb_cheered') === 'true';

  if (hasCheered) {
    cheerBtn.classList.add('cheered');
  }

  cheerBtn.addEventListener('click', (e) => {
    if (hasCheered) {
      // 2번 이상 클릭 시 제한 안내 메시지 전달
      showToast('1인당 한 번만 참여 가능합니다! 😊');
      cheerBtn.classList.add('shake');
      setTimeout(() => cheerBtn.classList.remove('shake'), 500);
      return;
    }

    // 첫 번째 클릭 시 응원 처리
    hasCheered = true;
    localStorage.setItem('hb_cheered', 'true');
    count++;
    cheerCount.textContent = count;
    cheerBtn.classList.add('active', 'cheered');

    // 게이지도 살짝 차오르는 재미 (87.6% -> 88.0%)
    if (hungerValue && gaugeBarFill) {
      hungerValue.textContent = '88.0%';
      gaugeBarFill.style.width = '88.0%';
    }

    // 버튼 튕김 애니메이션
    setTimeout(() => {
      cheerBtn.classList.remove('active');
    }, 400);

    createFloatingHeart(e.clientX, e.clientY);
    showToast('오현빈 님의 삼겹살 열망에 힘을 보탰습니다! 🥓');
  });
}

function createFloatingHeart(x, y) {
  const heart = document.createElement('div');
  heart.innerHTML = '❤️';
  heart.style.position = 'fixed';
  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;
  heart.style.fontSize = '24px';
  heart.style.pointerEvents = 'none';
  heart.style.zIndex = '3000';
  heart.style.transform = 'translate(-50%, -50%) scale(1)';
  heart.style.transition = 'transform 0.8s ease-out, opacity 0.8s ease-out';
  document.body.appendChild(heart);

  requestAnimationFrame(() => {
    const randomX = (Math.random() - 0.5) * 80;
    heart.style.transform = `translate(calc(-50% + ${randomX}px), -120px) scale(1.5)`;
    heart.style.opacity = '0';
  });

  setTimeout(() => {
    heart.remove();
  }, 800);
}

/* ------------------------------------------
   3. 취미 필터링 칩
------------------------------------------ */
function initFilterChips() {
  const chips = document.querySelectorAll('.chip');
  const hobbyCards = document.querySelectorAll('.hobby-card');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const filter = chip.dataset.filter;

      hobbyCards.forEach(card => {
        const category = card.dataset.category;
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeInUp 0.35s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ------------------------------------------
   4. 미니 음악 플레이어 (Web Audio API 코드 멜로디)
------------------------------------------ */
/* ------------------------------------------
   4. 요즘 듣는 노래 (애플뮤직 링크 연동)
------------------------------------------ */
function initMiniPlayer() {
  const musicLinkBtn = document.getElementById('musicCardPlayBtn');
  if (musicLinkBtn) {
    musicLinkBtn.addEventListener('click', () => {
      showToast('오현빈 님의 추천곡(Hype Boy)으로 이동합니다 🎧');
    });
  }
}

/* ------------------------------------------
   5. 가상 삼겹살 펀딩 모달 (토스 송금 & 금액별 맞춤 축하)
------------------------------------------ */
function initTreatModal() {
  const modal = document.getElementById('treatModal');
  const openBtn = document.getElementById('openTreatModalBtn');
  const quickSendBtn = document.getElementById('quickSendBtn');
  const closeBtn = document.getElementById('closeModalBtn');
  const step1 = document.getElementById('modalStep1');
  const step2 = document.getElementById('modalStep2');
  const confirmBtn = document.getElementById('confirmSendBtn');
  const doneBtn = document.getElementById('modalDoneBtn');

  const amountDisplay = document.getElementById('selectedAmountDisplay');
  const amountOptions = document.querySelectorAll('.amount-option');

  const celebrationBadge = document.getElementById('celebrationBadge');
  const successIcon = document.getElementById('successIcon');
  const successTitle = document.getElementById('successTitle');
  const successDesc = document.getElementById('successDesc');

  let selectedAmount = 15000;

  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    step1.classList.remove('hidden');
    step2.classList.add('hidden');

    // 첫 번째 옵션(15,000원)으로 기본 선택 상태 리셋
    selectedAmount = 15000;
    amountDisplay.textContent = (15000).toLocaleString();
    amountOptions.forEach((opt, idx) => {
      if (idx === 0) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  openBtn.addEventListener('click', openModal);
  quickSendBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  amountOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      amountOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      selectedAmount = parseInt(opt.dataset.amount, 10);
      amountDisplay.textContent = selectedAmount.toLocaleString();
    });
  });

  confirmBtn.addEventListener('click', () => {
    confirmBtn.disabled = true;
    confirmBtn.textContent = '송금 처리 중...';

    setTimeout(() => {
      confirmBtn.disabled = false;
      confirmBtn.textContent = '보내기';
      step1.classList.add('hidden');
      step2.classList.remove('hidden');

      // 금액별 맞춤 축하 연출
      if (selectedAmount === 15000) {
        celebrationBadge.className = 'celebration-badge tier-15k';
        celebrationBadge.textContent = '🌱 소박하지만 소중한 한 끼';
        successIcon.className = 'check-circle tier-15k';
        successIcon.innerHTML = '🍜';
        successTitle.innerHTML = '15,000원 비빔면 세트 영접!';
        successDesc.innerHTML = '돈 벌기가 쉬운 줄 아냐... 이 귀한 비빔면 한 그릇,<br>면발 하나 남기지 않고 국물까지 싹싹 비우겠습니다. (감격)';
        playCelebrationSound('low');
        triggerTierConfetti(14, ['#3182f6', '#10b981'], ['🍜', '🥢']);
      } else if (selectedAmount === 35000) {
        celebrationBadge.className = 'celebration-badge tier-35k';
        celebrationBadge.textContent = '🔥 본격 삼겹살 2인분 파티';
        successIcon.className = 'check-circle tier-35k';
        successIcon.innerHTML = '🥓';
        successTitle.innerHTML = '35,000원 상당의 삼겹살이 불판에 올랐습니다!';
        successDesc.innerHTML = '지글지글 구워지는 고기 소리가 귓가를 울립니다.<br>상추에 마늘 쌈장 얹어서 야무지게 모시겠습니다. 사장님 공깃밥 추가요!';
        playCelebrationSound('mid');
        triggerTierConfetti(50, ['#f59e0b', '#ff5252', '#3182f6'], ['🥓', '🍖', '✨']);
      } else {
        // 50,000원 대환장 생일파티급 축하
        celebrationBadge.className = 'celebration-badge tier-50k';
        celebrationBadge.textContent = '👑 ★ 전설의 5만 풀코스 성탄절 ★ 👑';
        successIcon.className = 'check-circle tier-50k';
        successIcon.innerHTML = '🥳';
        successTitle.innerHTML = '경축! 50,000원 황제 풀코스 강림!';
        successDesc.innerHTML = '이 은혜 평생 잊지 않겠습니다... 오늘 밤 삼겹살 4인분에 비빔면 3봉지 끓여놓고 후원자님 계신 방향으로 3보 1배 하겠습니다. (남은 돈은 기부 확정!)';

        const modalBox = modal.querySelector('.toss-modal-box');
        modalBox.classList.add('party-earthquake');
        setTimeout(() => modalBox.classList.remove('party-earthquake'), 650);

        playCelebrationSound('high');
        triggerMegaBirthdayConfetti();
      }
    }, 600);
  });

  doneBtn.addEventListener('click', () => {
    closeModal();
    if (selectedAmount >= 50000) {
      showToast('황제급 대후원 감사합니다! 성은이 망극하옵니다 👑');
    } else {
      showToast(`${selectedAmount.toLocaleString()}원 상당의 맛있는 마음이 전해졌습니다! 🥳`);
    }
  });
}

/* ------------------------------------------
   금액별 Web Audio API 축하 사운드
------------------------------------------ */
function playCelebrationSound(tier) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    if (tier === 'low') {
      // 귀여운 퐁~ 소리
      playBeep(ctx, 523.25, 0.0, 0.25, 'sine');
    } else if (tier === 'mid') {
      // 쾌활한 3화음 아르페지오 (도-미-솔)
      playBeep(ctx, 523.25, 0.0, 0.2, 'triangle');
      playBeep(ctx, 659.25, 0.12, 0.2, 'triangle');
      playBeep(ctx, 783.99, 0.24, 0.4, 'triangle');
    } else if (tier === 'high') {
      // 웅장한 생일 축하 승리 멜로디 (도-도-레-도-파-미!)
      const melody = [
        { f: 523.25, t: 0.0, d: 0.18 },
        { f: 523.25, t: 0.18, d: 0.18 },
        { f: 587.33, t: 0.36, d: 0.3 },
        { f: 523.25, t: 0.68, d: 0.3 },
        { f: 698.46, t: 1.0, d: 0.35 },
        { f: 659.25, t: 1.38, d: 0.55 },
      ];
      melody.forEach(m => playBeep(ctx, m.f, m.t, m.d, 'triangle'));
    }
  } catch (e) {
    // 오디오 미지원 환경 graceful degradation
  }
}

function playBeep(ctx, freq, startTime, duration, type = 'sine') {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

  gain.gain.setValueAtTime(0.001, ctx.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + startTime + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + startTime);
  osc.stop(ctx.currentTime + startTime + duration);
}

/* ------------------------------------------
   금액별 콘페티 & 생일파티 연출
------------------------------------------ */
function triggerTierConfetti(count, colors, emojis = []) {
  for (let i = 0; i < count; i++) {
    const isEmoji = emojis.length > 0 && Math.random() > 0.6;
    const el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.left = '50%';
    el.style.top = '45%';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '3200';
    el.style.transition = 'transform 1.1s cubic-bezier(0.1, 0.9, 0.2, 1), opacity 1.1s ease';

    if (isEmoji) {
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.fontSize = `${16 + Math.random() * 12}px`;
    } else {
      el.style.width = '8px';
      el.style.height = '8px';
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    }

    document.body.appendChild(el);

    const destX = (Math.random() - 0.5) * (count > 20 ? 360 : 180);
    const destY = (Math.random() - 0.5) * (count > 20 ? 360 : 180) - 40;

    requestAnimationFrame(() => {
      el.style.transform = `translate(${destX}px, ${destY}px) rotate(${Math.random() * 720}deg)`;
      el.style.opacity = '0';
    });

    setTimeout(() => el.remove(), 1200);
  }
}

/* 5만원 전용: 초대형 생일파티 폭죽 샤워 */
function triggerMegaBirthdayConfetti() {
  const colors = ['#ff007f', '#ffd700', '#00e5ff', '#ff3d00', '#76ff03', '#d500f9'];
  const emojis = ['🎂', '🎉', '🥳', '🥩', '🍜', '💸', '👑', '✨', '🎁', '🍾'];

  // 화면 곳곳에서 160개의 파티클이 폭발
  for (let i = 0; i < 160; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.style.position = 'fixed';
      
      // 시작 지점: 중앙 및 상단 골고루
      const originX = window.innerWidth * (0.3 + Math.random() * 0.4);
      const originY = window.innerHeight * (0.35 + Math.random() * 0.2);
      el.style.left = `${originX}px`;
      el.style.top = `${originY}px`;
      el.style.pointerEvents = 'none';
      el.style.zIndex = '3300';
      el.style.transition = 'transform 1.4s cubic-bezier(0.1, 0.9, 0.2, 1), opacity 1.4s ease';

      if (i % 3 === 0) {
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.fontSize = `${20 + Math.random() * 16}px`;
      } else {
        const size = 6 + Math.random() * 8;
        el.style.width = `${size}px`;
        el.style.height = `${size * (Math.random() > 0.5 ? 1 : 2)}px`;
        el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        el.style.borderRadius = Math.random() > 0.5 ? '50%' : '3px';
      }

      document.body.appendChild(el);

      const destX = (Math.random() - 0.5) * (window.innerWidth * 0.85);
      const destY = (Math.random() - 0.7) * (window.innerHeight * 0.75);

      requestAnimationFrame(() => {
        el.style.transform = `translate(${destX}px, ${destY}px) rotate(${Math.random() * 1080}deg)`;
        el.style.opacity = '0';
      });

      setTimeout(() => el.remove(), 1500);
    }, i * 6);
  }
}

/* ------------------------------------------
   6. 인사 건네기 & 프로필 URL 복사
------------------------------------------ */
function initCopyAndGreetings() {
  const copyBtn = document.getElementById('copyUrlBtn');
  const sendGreetingsBtn = document.getElementById('sendGreetingsBtn');
  const instagramUrl = 'https://www.instagram.com/blliund';

  copyBtn.addEventListener('click', () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(instagramUrl).then(() => {
        showToast('인스타그램 프로필 링크가 복사되었습니다! 📋');
      }).catch(() => {
        fallbackCopyText(instagramUrl);
      });
    } else {
      fallbackCopyText(instagramUrl);
    }
  });

  if (sendGreetingsBtn) {
    sendGreetingsBtn.addEventListener('click', () => {
      showToast('오현빈 님의 인스타그램으로 연결합니다! ✨');
    });
  }
}

function fallbackCopyText(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand('copy');
    showToast('인스타그램 프로필 링크가 복사되었습니다! 📋');
  } catch (err) {
    showToast('링크 복사에 실패했습니다 🥲');
  }
  document.body.removeChild(textarea);
}

/* 토스트 메시지 헬퍼 */
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById('toastMessage');
  const toastText = document.getElementById('toastText');

  toastText.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}
