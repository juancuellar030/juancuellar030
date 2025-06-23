document.addEventListener('DOMContentLoaded', () => {
    // Select all sections and navigation buttons
    const testSections = document.querySelectorAll('.test-section');
    const audioPlayers = document.querySelectorAll('.audio-player-container audio');
    
    // userAnswers stores the user's current answers for all parts.
    let userAnswers = {}; 
    let totalQuestions = 0;

    // --- Correct Answers for the entire Listening Test ---
    const correctAnswers = {
        // Part 1: Drop Target ID -> Draggable Name ID
        'girl_in_tent_yellow_shirt': 'katy',
        'boy_on_red_bike': 'robert',
        'boy_with_map': 'oliver',
        'girl_with_sticks': 'helen',
        'girl_reading_book': 'sophia',
        'boy_by_fire': 'michael', 
        'girl_fishing_net': 'emma', 

        // Part 2: Text Input ID -> Correct Text
        'q2_q1': '10',
        'q2_q2': 'reading',
        'q2_q3': 'green street',
        'q2_q4': '07700900123',
        'q2_q5': 'pizza',

        // Part 4: Question Group ID -> Correct Answer Letter
        'q4_example': 'C',
        'q4_q1': 'A',
    };
    totalQuestions = Object.keys(correctAnswers).length;

    // --- Core Navigation Function ---
    function showSection(sectionId) {
        testSections.forEach(section => section.classList.remove('active', 'hidden'));
        testSections.forEach(section => {
            if (section.id === sectionId) {
                section.classList.add('active');
            } else {
                section.classList.add('hidden');
            }
        });

        audioPlayers.forEach(player => player.pause());

        if (sectionId === 'listening-intro') {
            resetAllAnswers();
        }

        const testContainer = document.querySelector('.test-container');
        if (testContainer) {
            testContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // --- FIXED: Event Listener for All Navigation Buttons ---
    // This uses event delegation, listening on the body for any click.
    // It then checks if the clicked item (or its parent) is a button we care about.
    document.body.addEventListener('click', (event) => {
        const button = event.target.closest('.nav-btn, .start-test-btn, .restart-btn');
        if (button) {
            const targetSection = button.dataset.target;
            if (targetSection) {
                showSection(targetSection);
            }
        }
    });


    // --- Part 1: Drag and Drop Logic (SIMPLIFIED & FIXED) ---
    let draggedItem = null;
    const draggableNames = document.querySelectorAll('.draggable-name');
    const dropTargets = document.querySelectorAll('.drop-target, .draggable-names-container');

    draggableNames.forEach(draggable => {
        draggable.addEventListener('dragstart', (e) => {
            draggedItem = e.target;
            setTimeout(() => e.target.classList.add('dragging'), 0);
        });
        draggable.addEventListener('dragend', () => {
            draggedItem.classList.remove('dragging');
            draggedItem = null;
        });
    });

    dropTargets.forEach(target => {
        target.addEventListener('dragover', e => {
            e.preventDefault();
            target.classList.add('drag-over');
        });
        target.addEventListener('dragleave', () => target.classList.remove('drag-over'));
        target.addEventListener('drop', e => {
            e.preventDefault();
            target.classList.remove('drag-over');
            if (!draggedItem) return;

            // If the target already has a name, move it back to the pool
            const existingName = target.querySelector('.draggable-name');
            if (existingName) {
                document.querySelector('.draggable-names-container').appendChild(existingName);
            }
            // Append the new dragged item
            target.appendChild(draggedItem);
        });
    });


    // --- Answer Collection for other parts (Your existing logic is good here) ---

    // For Part 4 (tick the box)
    document.querySelectorAll('#listening-part4 .option-card').forEach(card => {
        card.addEventListener('click', () => {
            const questionId = card.dataset.question;
            const answer = card.dataset.answer;
            document.querySelectorAll(`#listening-part4 .option-card[data-question="${questionId}"]`).forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            userAnswers[questionId] = answer;
        });
    });

    // For Part 2 (text inputs)
    document.querySelectorAll('#listening-part2 .text-answer').forEach(input => {
        input.addEventListener('input', (event) => {
            userAnswers[event.target.id] = event.target.value.trim().toLowerCase();
        });
    });
    
    // --- Reset All Answers ---
    function resetAllAnswers() {
        userAnswers = {};
        // Reset drag and drop
        const unassignedPool = document.querySelector('.draggable-names-container');
        draggableNames.forEach(name => {
            unassignedPool.appendChild(name);
            name.classList.remove('correct', 'incorrect');
        });
        document.querySelectorAll('.drop-target').forEach(target => {
            target.classList.remove('correct', 'incorrect');
        });
        // Reset text inputs
        document.querySelectorAll('.text-answer').forEach(input => {
            input.value = '';
            input.style.borderColor = '';
        });
        // Reset option cards
        document.querySelectorAll('.option-card').forEach(card => {
            card.classList.remove('selected', 'correct', 'incorrect');
        });
        // Clear results display
        document.getElementById('final-results-display').innerHTML = '';
        document.getElementById('final-results-display').className = '';
    }

    // --- Final Check All Answers Button (SIMPLIFIED & FIXED) ---
    document.getElementById('check-all-listening-answers-btn').addEventListener('click', () => {
        let correctCount = 0;
        
        // --- CHECK PART 1: DRAG & DROP (New, simpler logic) ---
        const part1DropTargets = document.querySelectorAll('#listening-part1 .drop-target');
        part1DropTargets.forEach(target => {
            const dropZoneId = target.dataset.description;
            const droppedItem = target.querySelector('.draggable-name');
            
            target.classList.remove('correct', 'incorrect');
            if (droppedItem) {
                droppedItem.classList.remove('correct', 'incorrect');
            }

            const correctAnswerForZone = correctAnswers[dropZoneId];
            if (droppedItem && droppedItem.dataset.name === correctAnswerForZone) {
                correctCount++;
                target.classList.add('correct');
                droppedItem.classList.add('correct');
            } else if (droppedItem) { // Dropped but incorrect
                target.classList.add('incorrect');
                droppedItem.classList.add('incorrect');
            }
        });

        // --- CHECK PART 2: TEXT INPUTS ---
        for (const qId in correctAnswers) {
            if (qId.startsWith('q2_')) {
                const inputElement = document.getElementById(qId);
                const userAnswer = userAnswers[qId] || '';
                inputElement.style.borderColor = ''; // Reset border
                if (userAnswer === correctAnswers[qId]) {
                    correctCount++;
                    inputElement.style.borderColor = '#4caf50'; // Green
                } else {
                    inputElement.style.borderColor = '#f44336'; // Red
                }
            }
        }

        // --- CHECK PART 4: TICK THE BOX ---
        for (const qId in correctAnswers) {
            if (qId.startsWith('q4_')) {
                const allOptions = document.querySelectorAll(`.option-card[data-question="${qId}"]`);
                allOptions.forEach(card => card.classList.remove('correct', 'incorrect'));

                const userAnswer = userAnswers[qId];
                if (userAnswer === correctAnswers[qId]) {
                    correctCount++;
                    const selectedCard = document.querySelector(`.option-card[data-question="${qId}"].selected`);
                    if (selectedCard) selectedCard.classList.add('correct');
                } else {
                    const selectedCard = document.querySelector(`.option-card[data-question="${qId}"].selected`);
                    if (selectedCard) selectedCard.classList.add('incorrect');
                    // Also show the correct one
                    const correctCard = document.querySelector(`.option-card[data-question="${qId}"][data-answer="${correctAnswers[qId]}"]`);
                    if (correctCard) correctCard.classList.add('correct');
                }
            }
        }

        // --- Display final score ---
        const finalResultsDisplay = document.getElementById('final-results-display');
        const percentage = (correctCount / totalQuestions) * 100;
        let resultClass = 'incorrect';
        if (percentage === 100) resultClass = 'correct';
        else if (percentage >= 50) resultClass = 'partial';
        
        finalResultsDisplay.innerHTML = `<p>You scored ${correctCount} out of ${totalQuestions} (${percentage.toFixed(0)}%).</p>`;
        finalResultsDisplay.className = resultClass;
    });

    // --- Initial setup ---
    showSection('listening-intro');
});
