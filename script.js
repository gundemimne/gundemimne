document.addEventListener('DOMContentLoaded', () => {
    const interestCards = document.querySelectorAll('.interest-card');
    const selectedList = document.getElementById('selected-list');
    const copyButton = document.getElementById('copy-button');
    const shareButton = document.getElementById('share-button');
    const modal = document.getElementById('copy-modal');
    const modalContent = document.getElementById('modal-content');
    
    const copyModal = document.getElementById('copy-modal');
    const copySelectedBtn = document.getElementById('copy-selected-btn');
    
    let selectedInterests = new Set();

    // Handle interest card selection
    interestCards.forEach(card => {
        card.addEventListener('click', () => {
            const interest = card.dataset.interest;
            if (selectedInterests.has(interest)) {
                selectedInterests.delete(interest);
                card.classList.remove('selected');
                updateSelectedList();
            } else {
                selectedInterests.add(interest);
                card.classList.add('selected');
                updateSelectedList();
            }
        });
    });
    function getTweetText(selectedInterests) {
        let tweet = "Benim gündemim:\n";
        selectedInterests.forEach((interest, idx) => {
            tweet += `${idx + 1}- ${interest}\n`;
        });
        return tweet.trim();
    }
    copyModal.addEventListener('click', function(e) {
    if (e.target === copyModal) {
        copyModal.style.display = 'none';
    }
    });
    function getSelectedInterests() {
        const tags = document.querySelectorAll('#selected-list .selected-tag');
        return Array.from(tags).map(tag => tag.textContent.trim().replace('×', '').trim());
    }

    document.getElementById('share-button').addEventListener('click', function() {
    const selectedInterests = getSelectedInterests();
    if (selectedInterests.length === 0) {
        alert("Lütfen en az bir gündem seçin.");
        return;
    }
    const tweetText = getTweetText(selectedInterests);
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, '_blank');
    });
    // Update the selected interests display
    function updateSelectedList() {
        selectedList.innerHTML = '';
        selectedInterests.forEach(interest => {
            const tag = document.createElement('div');
            tag.className = 'selected-tag';
            tag.innerHTML = `
                ${interest}
                <button onclick="removeInterest('${interest}')">&times;</button>
            `;
            selectedList.appendChild(tag);
        });
    }

    // Remove interest from selection
    window.removeInterest = (interest) => {
        selectedInterests.delete(interest);
        document.querySelector(`[data-interest="${interest}"]`).classList.remove('selected');
        updateSelectedList();
    };

    // Create modal content with selected cards
    function createModalContent() {
        if (selectedInterests.size === 0) {
            alert('Please select at least one interest');
            return;
        }

        modalContent.innerHTML = '';
        
        // Add copy button at the top right
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = 'Copy to Clipboard';
        copyButton.onclick = () => {
            const interestsText = Array.from(selectedInterests).join(', ');
            copyToClipboard(interestsText);
        };
        modalContent.appendChild(copyButton);

        const grid = document.createElement('div');
        grid.className = 'modal-grid';

        selectedInterests.forEach(interest => {
            const card = document.querySelector(`[data-interest="${interest}"]`);
            const modalCard = document.createElement('div');
            modalCard.className = 'modal-card';
            modalCard.innerHTML = `
                <div class="card-image">
                    <img src="${card.querySelector('img').src}" alt="${interest}">
                </div>
                <h3>${interest}</h3>
                <p>${card.querySelector('p').textContent}</p>
            `;
            grid.appendChild(modalCard);
        });

        modalContent.appendChild(grid);
        modal.style.display = 'block';
    }

    // Handle copy button click
    copyButton.addEventListener('click', () => {
        createModalContent();
    });

    // Handle share button click
    shareButton.addEventListener('click', () => {
        if (selectedInterests.size === 0) {
            alert('Please select at least one interest');
            return;
        }

        const interestsText = Array.from(selectedInterests).join(', ');
        const tweetText = encodeURIComponent(`My selected journal interests: ${interestsText}`);
        const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    });

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Copy to clipboard function
    window.copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy text. Please try again.');
        });
    };

    // Show modal when clicking on selected interests
    selectedList.addEventListener('click', (event) => {
        if (event.target === selectedList || event.target.parentElement === selectedList) {
            createModalContent();
        }
    });
}); 

document.getElementById('copy-selected-btn').addEventListener('click', function() {
    const selectedCards = document.querySelectorAll('.interest-card.selected');
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = '';

    if (selectedCards.length === 0) {
        modalContent.innerHTML = '<p style="color:#fff;text-align:center;">Hiçbir kart seçilmedi.</p>';
    } else {
        selectedCards.forEach(card => {
            const img = card.querySelector('img');
            const title = card.querySelector('h3') ? card.querySelector('h3').textContent : '';
            const desc = card.querySelector('p') ? card.querySelector('p').textContent : '';

            const modalCard = document.createElement('div');
            modalCard.className = 'modal-card';
            modalCard.innerHTML = `
                <div class="card-image">
                    ${img ? `<img src="${img.src}" alt="${img.alt}">` : ''}
                </div>
                <h3>${title}</h3>
                ${desc ? `<p>${desc}</p>` : ''}
            `;
            modalContent.appendChild(modalCard);
        });
    }

    document.getElementById('copy-modal').style.display = 'block';
});

// Modalı kapatmak için kapat butonu
document.getElementById('close-modal-btn').addEventListener('click', function() {
    document.getElementById('copy-modal').style.display = 'none';
});

// Modalı kapatmak için ESC tuşu
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.getElementById('copy-modal').style.display = 'none';
    }
});