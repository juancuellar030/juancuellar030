document.addEventListener('DOMContentLoaded', () => {
    // --- Select all necessary elements ---
    const nameInput = document.getElementById('user-name-input');
    const startButton = document.querySelector('.start-test-btn');
    const testSections = document.querySelectorAll('.test-section');
    const audioPlayers = document.querySelectorAll('.audio-player-container audio');
    
    // --- State variables ---
    let userName = ''; 
    let userAnswers = {}; 
    let totalQuestions = 0;

    const correctAnswers = {
        'boy_on_rock_magazine': 'michael', 'girl_jumping_stream': 'sophia', 'boy_on_bike_helmet': 'oliver',
        'girl_by_fire': 'emma', 'boy_in_cave_torch': 'robert', 'girl_on_tablet_no_shoes': 'katy',
        'q2_q1': '10', 'q2_q2': 'reading', 'q2_q3': 'green street', 'q2_q4': '07700900123', 'q2_q5': 'pizza',
        'q4_example': 'C', 'q4_q1': 'A',
    };
    totalQuestions = Object.keys(correctAnswers).length;

    nameInput.addEventListener('input', () => {
        startButton.disabled = nameInput.value.trim() === '';
    });

    function showSection(sectionId) {
        testSections.forEach(section => {
            section.classList.toggle('active', section.id === sectionId);
            section.classList.toggle('hidden', section.id !== sectionId);
        });

        audioPlayers.forEach(player => player.pause());
        
        if (sectionId === 'listening-part1') {
            const michaelElement = document.querySelector('.draggable-name[data-name="michael"]');
            const michaelTargetZone = document.querySelector('.drop-target[data-description="boy_on_rock_magazine"]');
            if (michaelElement && michaelTargetZone && michaelTargetZone.children.length === 0) {
                michaelTargetZone.appendChild(michaelElement);
                userAnswers['boy_on_rock_magazine'] = 'michael';
            }
        }
        
        if (sectionId === 'listening-intro') {
            resetAllAnswers();
        }
        
        document.querySelector('.test-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    document.body.addEventListener('click', (event) => {
        const button = event.target.closest('.nav-btn, .start-test-btn, .restart-btn');
        if (button) {
            if (button.classList.contains('start-test-btn')) {
                userName = nameInput.value.trim();
            }
            showSection(button.dataset.target);
        }
    });

    let draggedItem = null;
    const scrollContainer = document.querySelector('.content-wrapper');
    document.addEventListener('drag', (e) => {
        if (!draggedItem) return;
        const rect = scrollContainer.getBoundingClientRect();
        if (e.clientY < rect.top + 60) scrollContainer.scrollTop -= 15;
        else if (e.clientY > rect.bottom - 60) scrollContainer.scrollTop += 15;
    });

    document.querySelectorAll('.draggable-name').forEach(draggable => {
        draggable.addEventListener('dragstart', (e) => {
            draggedItem = e.target;
            setTimeout(() => e.target.classList.add('dragging'), 0);
        });
        draggable.addEventListener('dragend', () => {
            draggedItem?.classList.remove('dragging');
            draggedItem = null;
        });
    });

    // --- FIXED: Restored full logic for dragover and dragleave for hover effect ---
    document.querySelectorAll('.drop-target, .names-pool').forEach(target => {
        target.addEventListener('dragover', e => {
            e.preventDefault(); // This is necessary to allow a drop
            target.classList.add('drag-over'); // This creates the hover effect
        });

        target.addEventListener('dragleave', () => {
            target.classList.remove('drag-over'); // This removes the hover effect
        });

        target.addEventListener('drop', e => {
            e.preventDefault();
            target.classList.remove('drag-over'); // Also remove hover on drop
            if (!draggedItem) return;

            const existingName = target.querySelector('.draggable-name');
            if (existingName) {
                document.getElementById('names-pool-bottom').appendChild(existingName);
            }
            target.appendChild(draggedItem);
        });
    });

    // --- FIXED: Updated reset logic to know Michael starts in the bottom pool ---
    function resetAllAnswers() {
        userAnswers = {};
        document.querySelectorAll('.correct, .incorrect').forEach(el => el.classList.remove('correct', 'incorrect'));
        document.querySelectorAll('.text-answer').forEach(input => { input.value = ''; input.style.borderColor = ''; });
        document.querySelectorAll('.option-card.selected').forEach(card => card.classList.remove('selected'));
        document.getElementById('final-results-display').innerHTML = '';

        document.querySelectorAll('.draggable-name').forEach(nameEl => {
            const name = nameEl.dataset.name;
            if (['katy', 'robert', 'oliver'].includes(name)) {
                document.getElementById('names-pool-top').appendChild(nameEl);
            } else {
                // All other names (Sophia, Michael, Helen, Emma) go to the bottom pool
                document.getElementById('names-pool-bottom').appendChild(nameEl);
            }
        });
    }

    function submitResultsToGoogle(name, score) { /* ... Your Google Form logic is fine and remains here ... */ }

    document.getElementById('check-all-listening-answers-btn').addEventListener('click', () => { /* ... Your checking logic is fine and remains here ... */ });

    // Initial setup
    showSection('listening-intro');
});
