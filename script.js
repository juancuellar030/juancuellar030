document.addEventListener('DOMContentLoaded', () => {
    const testSections = document.querySelectorAll('.test-section');
    const audioPlayers = document.querySelectorAll('.audio-player-container audio');
    let userAnswers = {}; 
    let totalQuestions = 0;

    // --- UPDATED: Correct Answers for the entire Listening Test ---
    const correctAnswers = {
        // Part 1: New keys and values based on your audio
        'boy_on_rock_magazine': 'michael',  // The example
        'girl_jumping_stream': 'sophia',   // Q1
        'boy_on_bike_helmet': 'oliver',    // Q2
        'girl_by_fire': 'emma',            // Q3
        'boy_in_cave_torch': 'robert',     // Q4
        'girl_on_tablet_no_shoes': 'katy', // Q5

        // Part 2: Text Input ID -> Correct Text (Keep as is)
        'q2_q1': '10',
        'q2_q2': 'reading',
        'q2_q3': 'green street',
        'q2_q4': '07700900123',
        'q2_q5': 'pizza',

        // Part 4: Question Group ID -> Correct Answer Letter (Keep as is)
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

        // --- NEW LOGIC: Place the example for Part 1 ---
        if (sectionId === 'listening-part1') {
            // Find the elements for the example
            const michaelElement = document.querySelector('.draggable-name[data-name="michael"]');
            const michaelTargetZone = document.querySelector('.drop-target[data-description="boy_on_rock_magazine"]');

            // If they exist and the target is empty, place the example
            if (michaelElement && michaelTargetZone && michaelTargetZone.children.length === 0) {
                michaelTargetZone.appendChild(michaelElement);
                // Also pre-fill the answer for checking purposes
                userAnswers['boy_on_rock_magazine'] = 'michael';
            }
        }
        
        if (sectionId === 'listening-intro') {
            resetAllAnswers();
        }

        const testContainer = document.querySelector('.test-container');
        if (testContainer) {
            testContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    
    // --- Event Listeners and other functions remain the same ---
    
    // Event Listener for All Navigation Buttons
    document.body.addEventListener('click', (event) => {
        const button = event.target.closest('.nav-btn, .start-test-btn, .restart-btn');
        if (button) {
            const targetSection = button.dataset.target;
            if (targetSection) {
                showSection(targetSection);
            }
        }
    });

    // Part 1: Drag and Drop Logic
    let draggedItem = null;
    const draggableNames = document.querySelectorAll('.draggable-name');
    const dropTargets = document.querySelectorAll('.drop-target, .draggable-names-container');

    draggableNames.forEach(draggable => {
        draggable.addEventListener('dragstart', (e) => {
            draggedItem = e.target;
            setTimeout(() => e.target.classList.add('dragging'), 0);
        });
        draggable.addEventListener('dragend', () => {
            if(draggedItem) draggedItem.classList.remove('dragging');
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

            // Update userAnswers object
            const droppedName = draggedItem.dataset.name;
            const targetZoneId = target.dataset.description;

            // If this item was dropped somewhere else before, clear that old answer
            for (const key in userAnswers) {
                if (userAnswers[key] === droppedName) {
                    delete userAnswers[key];
                }
            }
            // Add new answer if dropped on a question zone
            if (targetZoneId !== 'unassigned-names-pool') {
                 userAnswers[targetZoneId] = droppedName;
            }

            // If the target already has a name, move it back to the pool
            const existingName = target.querySelector('.draggable-name');
            if (existingName) {
                document.querySelector('.draggable-names-container').appendChild(existingName);
            }
            
            target.appendChild(draggedItem);
        });
    });

    // Answer Collection for other parts
    document.querySelectorAll('#listening-part4 .option-card').forEach(card => {
        card.addEventListener('click', () => {
            const questionId = card.dataset.question;
            const answer = card.dataset.answer;
            document.querySelectorAll(`#listening-part4 .option-card[data-question="${questionId}"]`).forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            userAnswers[questionId] = answer;
        });
    });
    document.querySelectorAll('#listening-part2 .text-answer').forEach(input => {
        input.addEventListener('input', (event) => {
            userAnswers[event.target.id] = event.target.value.trim().toLowerCase();
        });
    });
    
    // Reset All Answers
    function resetAllAnswers() {
        userAnswers = {};
        const unassignedPool = document.querySelector('.draggable-names-container');
        draggableNames.forEach(name => {
            unassignedPool.appendChild(name);
            name.classList.remove('correct', 'incorrect');
        });
        document.querySelectorAll('.drop-target').forEach(target => {
            target.classList.remove('correct', 'incorrect');
        });
        document.querySelectorAll('.text-answer').forEach(input => {
            input.value = '';
            input.style.borderColor = '';
        });
        document.querySelectorAll('.option-card').forEach(card => {
            card.classList.remove('selected', 'correct', 'incorrect');
        });
        document.getElementById('final-results-display').innerHTML = '';
        document.getElementById('final-results-display').className = '';
    }

    // Final Check All Answers Button
    document.getElementById('check-all-listening-answers-btn').addEventListener('click', () => {
        let correctCount = 0;
        
        // --- CHECK PART 1: DRAG & DROP ---
        const part1DropTargets = document.querySelectorAll('#listening-part1 .drop-target');
        part1DropTargets.forEach(target => {
            const dropZoneId = target.dataset.description;
            const droppedItem = target.querySelector('.draggable-name');
            
            target.classList.remove('correct', 'incorrect');
            if (droppedItem) droppedItem.classList.remove('correct', 'incorrect');

            if (correctAnswers.hasOwnProperty(dropZoneId)) {
                if (droppedItem && droppedItem.dataset.name === correctAnswers[dropZoneId]) {
                    correctCount++;
                    target.classList.add('correct');
                    droppedItem.classList.add('correct');
                } else if (droppedItem) {
                    target.classList.add('incorrect');
                    droppedItem.classList.add('incorrect');
                }
            }
        });

        // CHECK OTHER PARTS (No change to this logic)
        for (const qId in correctAnswers) {
            if (qId.startsWith('q2_')) {
                const inputElement = document.getElementById(qId);
                const userAnswer = userAnswers[qId] || '';
                inputElement.style.borderColor = '';
                if (userAnswer === correctAnswers[qId]) {
                    correctCount++;
                    inputElement.style.borderColor = '#4caf50';
                } else {
                    inputElement.style.borderColor = '#f44336';
                }
            } else if (qId.startsWith('q4_')) {
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
                    const correctCard = document.querySelector(`.option-card[data-question="${qId}"][data-answer="${correctAnswers[qId]}"]`);
                    if (correctCard) correctCard.classList.add('correct');
                }
            }
        }

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
