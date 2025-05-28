export const playMonetSound = () => {
  try {
    const sounds = [
      '/assets/zvuk-monetyi-na-tverdoy-poverhnosti-30627.wav',
      '/assets/zvuk-monetyi-na-tverdoy-poverhnosti-3-30629.wav',
      '/assets/monetyi-padayut-na-derevyannuyu-poverhnost-26146.wav'
    ];
    
    const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
    const audio = new Audio(randomSound);
    audio.play();
  } catch (error) {
    console.error('Failed to play sound:', error);
  }
};

export const showConfetti = () => {
  const confettiContainer = document.createElement('div');
  confettiContainer.style.position = 'fixed';
  confettiContainer.style.top = '0';
  confettiContainer.style.left = '0';
  confettiContainer.style.width = '100%';
  confettiContainer.style.height = '100%';
  confettiContainer.style.pointerEvents = 'none';
  confettiContainer.style.zIndex = '9999';
  document.body.appendChild(confettiContainer);

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
  
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'absolute';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.top = '-10px';
    confetti.style.borderRadius = '50%';
    confetti.style.animation = `confetti-fall ${2 + Math.random() * 3}s linear forwards`;
    confettiContainer.appendChild(confetti);
  }

  if (!document.getElementById('confetti-styles')) {
    const style = document.createElement('style');
    style.id = 'confetti-styles';
    style.textContent = `
      @keyframes confetti-fall {
        to {
          transform: translateY(100vh) rotate(360deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => {
    document.body.removeChild(confettiContainer);
  }, 5000);
};