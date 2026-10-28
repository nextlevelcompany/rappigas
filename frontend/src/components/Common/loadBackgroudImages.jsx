'use client';

export default function loadBackgroudImages() {
    if (typeof window === 'undefined') return;
    const backgroudImages = document.querySelectorAll('[data-background]');
  
    if (backgroudImages.length > 0) {
      backgroudImages.forEach(element => {
        let image = element.getAttribute('data-background');
        element.style.backgroundImage = `url(${image})`;
      });
    }
  }
