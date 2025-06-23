document.addEventListener('DOMContentLoaded', () => {
    const testSections = document.querySelectorAll('.test-section');
    const audioPlayers = document.querySelectorAll('.audio-player-container audio');
    let userAnswers = {}; 
    let totalQuestions = 0;

    const correctAnswers = {
        'boy_on_rock_magazine': 'michael', 'girl_jumping_stream': 'sophia', 'boy_on_bike_helmet': 'oliver',
        'girl_by_fire': 'emma', 'boy_in_cave_torch': 'robert', 'girl_on_tablet_no_shoes': 'katy',
        'q2_q1': '10', 'q2_q2': 'reading', 'q2_q3': 'green street', 'q2_q4': '07700900123', 'q2_q5': 'pizza',
        'q4_example': 'C', 'q4_q1': 'A',
    };
    totalQuestions = Object.keys(correctAnswers).length;

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
        if (button) showSection(button.dataset.target);
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

    document.querySelectorAll('.drop-target, .names-pool').forEach(target => {
        target.addEventListener('dragover', e => e.preventDefault());
        target.addEventListener('drop', e => {
            e.preventDefault();
            if (!draggedItem) return;
            const existingName = target.querySelector('.draggable-name');
            // If swapping, send existing name to the bottom pool
            if (existingName) {
                document.getElementById('names-pool-bottom').appendChild(existingName);
            }
            target.appendChild(draggedItem);
        });
    });

    function resetAllAnswers() {
        userAnswers = {};
        // Clear feedback styles
        document.querySelectorAll('.correct, .incorrect').forEach(el => el.classList.remove('correct', 'incorrect'));
        document.querySelectorAll('.text-answer').forEach(input => { input.value = ''; input.style.borderColor = ''; });
        document.querySelectorAll('.option-card.selected').forEach(card => card.classList.remove('selected'));
        document.getElementById('final-results-display').innerHTML = '';

        // Reset names to their original pools
        document.querySelectorAll('.draggable-name').forEach(nameEl => {
            const name = nameEl.dataset.name;
            if (['katy', 'robert', 'oliver'].includes(name)) {
                document.getElementById('names-pool-top').appendChild(nameEl);
            } else {
                document.getElementById('names-pool-bottom').appendChild(nameEl);
            }
        });
    }

    document.getElementById('check-all-listening-answers-btn').addEventListener('click', () => {
        let correctCount = 0;
        
        // Clear all previous feedback first
        document.querySelectorAll('.correct, .incorrect').forEach(el => el.classList.remove('correct', 'incorrect'));

        // --- UPDATED PART 1 CHECKING LOGIC ---
        const part1AnswerKeys = Object.keys(correctAnswers).filter(k => !k.startsWith('q'));

        part1AnswerKeys.forEach(dropZoneId => {
            const targetZone = document.querySelector(`.drop-target[data-description="${dropZoneId}"]`);
            const droppedItem = targetZone.querySelector('.draggable-name');
            const correctAnswerName = correctAnswers[dropZoneId];

            if (droppedItem && droppedItem.dataset.name === correctAnswerName) {
                // Case 1: Correct answer
                correctCount++;
                targetZone.classList.add('correct');
                droppedItem.classList.add('correct');
            } else {
                // Case 2: Incorrect or empty
                targetZone.classList.add('incorrect');
                if (droppedItem) {
                    // There's a name here, but it's the wrong one
                    droppedItem.classList.add('incorrect');
                }
                
                // Highlight where the correct name *should have gone*
                const correctNameElement = document.querySelector(`.draggable-name[data-name="${correctAnswerName}"]`);
                if (correctNameElement) {
                    correctNameElement.classList.add('correct');
                }
            }
        });

        // Other parts checking (no changes needed here)
        Object.keys(correctAnswers).forEach(qId => {
            if (qId.startsWith('q2_')) { /* ... your q2 logic ... */ }
            if (qId.startsWith('q4_')) { /* ... your q4 logic ... */ }
        });


        // Display final score
        const finalResultsDisplay = document.getElementById('final-results-display');
        const percentage = (correctCount / totalQuestions) * 100;
        let resultClass = 'incorrect';
        if (percentage === 100) resultClass = 'correct';
        else if (percentage >= 50) resultClass = 'partial';
        
        finalResultsDisplay.innerHTML = `<p>You scored ${correctCount} out of ${totalQuestions} (${percentage.toFixed(0)}%).</p>`;
        finalResultsDisplay.className = resultClass;
    });

    // Initial setup
    showSection('listening-intro');
});
