/**
 * Gündemim Ne — Selection & Poster Generation
 */

document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.gundem-card');
    const countEl = document.getElementById('card-count');
    const actionBar = document.getElementById('action-bar');
    const selectedCountEl = document.getElementById('selected-count');
    const clearBtn = document.getElementById('clear-btn');
    const posterBtn = document.getElementById('poster-btn');
    const posterModal = document.getElementById('poster-modal');
    const posterGrid = document.getElementById('poster-grid');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const downloadBtn = document.getElementById('download-btn');
    const shareXBtn = document.getElementById('share-x-btn');

    const selectedCards = new Set();

    // Update card count in header
    if (countEl) countEl.textContent = cards.length;

    // Inject checkmark circles into each card (so we don't need them in HTML)
    cards.forEach(card => {
        const wrapper = card.querySelector('.card-img-wrapper');
        if (wrapper && !wrapper.querySelector('.card-check')) {
            const check = document.createElement('div');
            check.className = 'card-check';
            check.innerHTML = '<i class="fas fa-check"></i>';
            wrapper.appendChild(check);
        }
    });

    // Card click → toggle selection
    cards.forEach((card, idx) => {
        card.addEventListener('click', () => {
            if (selectedCards.has(idx)) {
                selectedCards.delete(idx);
                card.classList.remove('selected');
            } else {
                selectedCards.add(idx);
                card.classList.add('selected');
            }
            updateActionBar();
        });
    });

    function updateActionBar() {
        const count = selectedCards.size;
        selectedCountEl.textContent = count;
        if (count > 0) {
            actionBar.classList.add('visible');
        } else {
            actionBar.classList.remove('visible');
        }
    }

    // Clear all
    clearBtn.addEventListener('click', () => {
        selectedCards.clear();
        cards.forEach(c => c.classList.remove('selected'));
        updateActionBar();
    });

    // Generate poster
    posterBtn.addEventListener('click', () => {
        if (selectedCards.size === 0) return;
        buildPoster();
        posterModal.classList.add('visible');
        document.body.style.overflow = 'hidden';
    });

    function buildPoster() {
        posterGrid.innerHTML = '';

        // Decide grid columns based on count
        const count = selectedCards.size;
        let cols;
        if (count <= 3) cols = count;
        else if (count <= 6) cols = 3;
        else cols = 4;
        posterGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        selectedCards.forEach(idx => {
            const card = cards[idx];
            const img = card.querySelector('img');
            const title = card.querySelector('h3').textContent;
            const imgSrc = img.getAttribute('src'); // relative path

            const item = document.createElement('div');
            item.className = 'poster-item';
            item.innerHTML = `
                <img src="${imgSrc}" alt="${title}">
                <div class="poster-item-title">${title}</div>
            `;
            posterGrid.appendChild(item);
        });
    }

    // Close modal
    closeModalBtn.addEventListener('click', closeModal);
    posterModal.addEventListener('click', (e) => {
        if (e.target === posterModal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    function closeModal() {
        posterModal.classList.remove('visible');
        document.body.style.overflow = '';
    }

    // Download poster as PNG
    downloadBtn.addEventListener('click', () => {
        const canvas = document.getElementById('poster-canvas');
        html2canvas(canvas, {
            backgroundColor: '#0d0f14',
            scale: 2,
            allowTaint: true,
            logging: false
        }).then(renderedCanvas => {
            const link = document.createElement('a');
            link.download = 'benim-gundemim.png';
            link.href = renderedCanvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            console.error('Poster oluşturma hatası:', err);
            alert('Poster oluşturulurken bir hata oluştu.');
        });
    });

    // Share on X — copy poster image to clipboard, then open tweet compose
    shareXBtn.addEventListener('click', () => {
        const canvas = document.getElementById('poster-canvas');
        const originalText = shareXBtn.innerHTML;

        shareXBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Hazırlanıyor...';
        shareXBtn.disabled = true;

        html2canvas(canvas, {
            backgroundColor: '#0d0f14',
            scale: 2,
            allowTaint: true,
            logging: false
        }).then(renderedCanvas => {
            renderedCanvas.toBlob(blob => {
                if (blob && navigator.clipboard && window.ClipboardItem) {
                    navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]).then(() => {
                        // Open X with pre-filled text
                        let tweet = 'Benim gündemim:\n\ngundemimne.com';
                        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
                        window.open(url, '_blank');

                        // Show success feedback
                        shareXBtn.innerHTML = '<i class="fas fa-check"></i> Poster kopyalandı! Yapıştır (Ctrl+V)';
                        shareXBtn.disabled = false;
                        setTimeout(() => {
                            shareXBtn.innerHTML = originalText;
                        }, 5000);
                    }).catch(() => {
                        // Clipboard failed — fallback to text only
                        fallbackShareText();
                        shareXBtn.innerHTML = originalText;
                        shareXBtn.disabled = false;
                    });
                } else {
                    // Clipboard API not available — fallback
                    fallbackShareText();
                    shareXBtn.innerHTML = originalText;
                    shareXBtn.disabled = false;
                }
            }, 'image/png');
        }).catch(() => {
            fallbackShareText();
            shareXBtn.innerHTML = originalText;
            shareXBtn.disabled = false;
        });

        function fallbackShareText() {
            const titles = [];
            selectedCards.forEach(idx => {
                titles.push(cards[idx].querySelector('h3').textContent);
            });
            let tweet = 'Benim gündemim:\n';
            titles.forEach((t, i) => {
                tweet += `${i + 1}. ${t}\n`;
            });
            tweet += '\ngundemimne.com';
            const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet.trim())}`;
            window.open(url, '_blank');
        }
    });

    // IntersectionObserver for scroll-triggered card reveal
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        cards.forEach(card => {
            card.style.animationPlayState = 'paused';
            observer.observe(card);
        });
    }
});
