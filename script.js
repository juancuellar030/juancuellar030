document.addEventListener('DOMContentLoaded', () => {
    // Select all sections and navigation buttons
    const testSections = document.querySelectorAll('.test-section');
    const navButtons = document.querySelectorAll('.nav-btn, .start-test-btn');
    const audioPlayers = document.querySelectorAll('.audio-player-container audio');

    let currentSectionId = 'listening-intro'; // Starting section
    // userAnswers stores the assignment of dropZoneId to draggableNameData
    // Example: { 'girl_in_tent_yellow_shirt': 'katy', 'boy_on_red_bike': 'robert' }
    let userAnswers = {}; 
    let totalQuestions = 0; // Will be calculated based on correctAnswers


    // --- Correct Answers for the entire Listening Test ---
    // The keys here represent the ID of the drop target (data-description for Part 1)
    // The values are the data-name of the draggable item that should be dropped there.
    const correctAnswers = {
        // Listening Part 1 (Drag and Drop)
        // Map: Drop Target ID (description) -> Draggable Item ID (name)
        // Based on image_a5f549.jpg answer key:
        'girl_in_tent_yellow_shirt': 'katy',
        'boy_on_red_bike': 'robert',
        'boy_with_map': 'oliver',
        'girl_with_sticks': 'helen',
        'girl_reading_book': 'sophia',
        'boy_by_fire': 'michael', // Example if Michael maps to boy_by_fire
        'girl_fishing_net': 'emma', // Example if Emma maps to girl_fishing_net


        // Listening Part 2 (Text/Number Inputs) - Example answers
        'q2_q1': '10', // Age (assuming text '10' or number 10)
        'q2_q2': 'reading', // Favorite hobby
        'q2_q3': 'green street', // Lives on (lowercase for case-insensitive check)
        'q2_q4': '07700900123', // Telephone number (example)
        'q2_q5': 'pizza', // Favorite food

        // Listening Part 4 (Tick the box) - Example answers (based on your HTML structure)
        'q4_example': 'C', // Example question from HTML
        'q4_q1': 'A', // Question 1 from HTML
        'q4_q2': 'B', // Placeholder for next question
        'q4_q3': 'A', // Placeholder for next question
        'q4_q4': 'C', // Placeholder for next question
        'q4_q5': 'B', // Placeholder for next question

        // Listening Part 3 (Match) - This will be added in a future step.

        // Listening Part 5 (Colour/Write) - This will be added in a future step.
    };

    // Calculate total questions dynamically from the correctAnswers object
    totalQuestions = Object.keys(correctAnswers).length;


    // --- Core Navigation Function ---
    function showSection(sectionId) {
        // Hide all sections first
        testSections.forEach(section => {
            section.classList.remove('active');
            section.classList.add('hidden');
        });

        // Show the target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.classList.remove('hidden');
            currentSectionId = sectionId;

            // Reset drag-and-drop state when entering Part 1
            if (sectionId === 'listening-part1') {
                resetDragAndDrop();
            }


            // Pause all audio players when changing sections
            audioPlayers.forEach(player => {
                player.pause();
                player.currentTime = 0; // Reset audio to beginning
            });

            // If the new section has an audio player, ensure its source is set and loaded
            const activeAudioPlayer = targetSection.querySelector('audio');
            if (activeAudioPlayer) {
                activeAudioPlayer.load(); // Load the audio (important if src changes or for fresh start)
                // Note: Autoplay is generally blocked by browsers until user interaction.
                // Consider adding a "Play Audio" button next to the player if auto-play is expected.
            }

            // Scroll to the top of the test container when a new section is shown
            const testContainer = document.querySelector('.test-container');
            if (testContainer) {
                testContainer.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }

    // --- Event Listeners for Navigation Buttons ---
    navButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const targetSection = event.target.dataset.target;
            if (targetSection) {
                showSection(targetSection);
            }
        });
    });

    // --- Part 1: Drag and Drop Logic ---
    let draggedItem = null; // Store the actual dragged element

    const draggableNames = document.querySelectorAll('.draggable-name');
    // Select all drop targets, including the unassigned names container
    const dropTargets = document.querySelectorAll('.drop-target'); 

    // Drag start event - store the element itself
    draggableNames.forEach(draggable => {
        draggable.addEventListener('dragstart', (e) => {
            draggedItem = e.target; // Store the element
            e.dataTransfer.setData('text/plain', e.target.dataset.name); 
            e.target.classList.add('dragging');
        });

        draggable.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
            draggedItem = null; // Clear dragged item data
        });
    });

    // Drop target events for ALL drop targets (specific zones in picture and the unassigned names container)
    dropTargets.forEach(target => {
        target.addEventListener('dragover', (e) => {
            e.preventDefault(); // Allow drop
            target.classList.add('drag-over');
        });

        target.addEventListener('dragenter', (e) => {
            e.preventDefault(); // Allow drop
            target.classList.add('drag-over');
        });

        target.addEventListener('dragleave', () => {
            target.classList.remove('drag-over');
        });

        target.addEventListener('drop', (e) => {
            e.preventDefault();
            target.classList.remove('drag-over');

            const droppedNameData = e.dataTransfer.getData('text/plain'); // e.g., 'katy'
            const targetDropZoneId = target.dataset.description; // e.g., 'girl_in_tent_yellow_shirt' or 'unassigned-names-pool'

            // If we don't have the element reference, find it (fallback for external drags or complex scenarios)
            if (!draggedItem) {
                draggedItem = document.querySelector(`.draggable-name[data-name="${droppedNameData}"]`);
            }

            // Ensure draggedItem is not null before proceeding
            if (!draggedItem) {
                console.error("Dragged item element not found.");
                return;
            }

            // --- 1. Clear previous assignment ---
            // Remove from previous drop zone if any
            const previousDropZone = draggedItem.closest('.drop-target');
            if (previousDropZone) {
                const prevZoneId = previousDropZone.dataset.description;
                // Only delete from userAnswers if it was a 'picture' drop zone
                if (prevZoneId && prevZoneId !== 'unassigned-names-pool') {
                    delete userAnswers[prevZoneId]; 
                    previousDropZone.classList.remove('filled');
                    // If it was a picture drop zone, its placeholder should be cleared
                    const prevPlaceholder = previousDropZone.querySelector('.dropped-name-placeholder');
                    if(prevPlaceholder) prevPlaceholder.textContent = '';
                }
            }
            
            // --- 2. Handle the new drop ---
            // If dropping into a picture drop zone
            if (targetDropZoneId && targetDropZoneId !== 'unassigned-names-pool') {
                // If there's already a name in this zone, move it back to pool
                // We need to check if the target drop zone currently *contains* a draggable-name element
                const existingNameInTarget = target.querySelector('.draggable-name');
                if (existingNameInTarget) {
                    const unassignedPool = document.querySelector('.draggable-names-container[data-description="unassigned-names-pool"]');
                    if (unassignedPool) {
                        unassignedPool.appendChild(existingNameInTarget);
                        // Clear feedback and hidden state for the name returned to the pool
                        existingNameInTarget.classList.remove('hidden-for-drop', 'correct', 'incorrect');
                    }
                    
                    // Clear its assignment from userAnswers
                    const existingNameData = existingNameInTarget.dataset.name;
                    for (const [zone, name] of Object.entries(userAnswers)) {
                        if (name === existingNameData) delete userAnswers[zone];
                    }
                }
                
                // Place new name in zone
                target.appendChild(draggedItem);
                target.classList.add('filled');
                draggedItem.classList.add('hidden-for-drop'); // Hide it from the original pool
                userAnswers[targetDropZoneId] = droppedNameData;
                
            } else if (targetDropZoneId === 'unassigned-names-pool') {
                // Dropping back into unassigned pool
                const unassignedPool = document.querySelector('.draggable-names-container[data-description="unassigned-names-pool"]');
                if (unassignedPool) {
                    unassignedPool.appendChild(draggedItem);
                    // Ensure it's visible and cleared of feedback
                    draggedItem.classList.remove('hidden-for-drop', 'correct', 'incorrect');
                }
                
                // Clear any assignments for this name from picture drop zones
                for (const [zone, name] of Object.entries(userAnswers)) {
                    if (name === droppedNameData) delete userAnswers[zone];
                }
            }
            
            // Clear feedback classes from the currently dragged item and the drop target
            draggedItem.classList.remove('correct', 'incorrect');
            target.classList.remove('correct', 'incorrect');

            console.log(`Dropped ${droppedNameData} onto ${targetDropZoneId}`);
            console.log("Current user answers for Part 1:", userAnswers);
        });
    });

    // Function to reset drag and drop state for Part 1
    function resetDragAndDrop() {
        const unassignedPool = document.querySelector('.draggable-names-container[data-description="unassigned-names-pool"]');
        if (!unassignedPool) {
            console.error("Unassigned names pool not found for reset.");
            return;
        }
        
        // Move all names back to the unassigned pool
        draggableNames.forEach(draggable => {
            unassignedPool.appendChild(draggable);
            draggable.classList.remove('hidden-for-drop'); // Make all names visible again
            draggable.classList.remove('correct', 'incorrect'); // Clear feedback
        });
        
        // Clear picture drop zones
        dropTargets.forEach(target => {
            // Ensure we only clear actual picture drop zones, not the unassigned-names-pool itself
            if (target.dataset.description && target.dataset.description !== 'unassigned-names-pool') {
                target.classList.remove('filled', 'correct', 'incorrect'); // Clear filled state and feedback
                target.style.borderColor = ''; // Clear any direct style if applied
                target.style.backgroundColor = '';
                const placeholder = target.querySelector('.dropped-name-placeholder');
                if (placeholder) {
                    placeholder.textContent = ''; // Clear displayed name
                }
            } else if (target.dataset.description === 'unassigned-names-pool') {
                // Ensure the unassigned pool also clears any drag-over state if it's lingering
                target.classList.remove('drag-over');
            }
        });
        
        // Clear all Part 1 answers from userAnswers
        const part1QuestionKeys = [
            'girl_in_tent_yellow_shirt',
            'boy_on_red_bike',
            'boy_with_map',
            'girl_with_sticks',
            'girl_reading_book',
            'boy_by_fire',
            'girl_fishing_net'
        ];
        part1QuestionKeys.forEach(key => {
            if (userAnswers.hasOwnProperty(key)) {
                delete userAnswers[key];
            }
        });
    }


    // --- Answer Collection Logic (from previous step, unchanged for other parts) ---

    // For Part 4 (tick the box - radio-like selection)
    document.querySelectorAll('#listening-part4 .option-card').forEach(card => {
        card.addEventListener('click', () => {
            const questionId = card.dataset.question;
            const answer = card.dataset.answer;

            // Remove 'selected' from other options for the same question
            document.querySelectorAll(`#listening-part4 .option-card[data-question="${questionId}"]`).forEach(otherCard => {
                otherCard.classList.remove('selected');
                // Remove feedback classes if re-selecting
                otherCard.classList.remove('correct', 'incorrect');
            });
            // Add 'selected' to the clicked card
            card.classList.add('selected');

            // Store the user's answer
            userAnswers[questionId] = answer;
            console.log(`User selected for Part 4, ${questionId}: ${answer}`);
        });
    });

    // For Part 2 (text/number input fields)
    document.querySelectorAll('#listening-part2 .text-answer').forEach(input => {
        input.addEventListener('input', (event) => {
            const questionId = event.target.id; // Using the input's ID as the questionId
            const answer = event.target.value.trim().toLowerCase(); // Trim whitespace and convert to lowercase for easier checking
            userAnswers[questionId] = answer;
            console.log(`User input for Part 2, ${questionId}: ${answer}`);
        });
    });

    // For Part 5 (Color Select / Text Input)
    document.querySelectorAll('#listening-part5 .color-select').forEach(select => {
        select.addEventListener('change', (event) => {
            const questionId = event.target.id;
            const answer = event.target.value.trim().toLowerCase();
            userAnswers[questionId] = answer;
            console.log(`User selected color for Part 5, ${questionId}: ${answer}`);
        });
    });

    document.querySelectorAll('#listening-part5 .text-answer').forEach(input => {
        input.addEventListener('input', (event) => {
            const questionId = event.target.id;
            const answer = event.target.value.trim().toLowerCase();
            userAnswers[questionId] = answer;
            console.log(`User input for Part 5, ${questionId}: ${answer}`);
        });
    });

    // --- Final Check All Answers Button (for the entire Listening Test) ---
    const checkAllListeningAnswersBtn = document.getElementById('check-all-listening-answers-btn');
    if (checkAllListeningAnswersBtn) {
        checkAllListeningAnswersBtn.addEventListener('click', () => {
            let correctCount = 0;
            const finalResultsDisplay = document.getElementById('final-results-display');
            finalResultsDisplay.innerHTML = ''; // Clear previous results

            // Iterate through all correct answers to check user's responses
            for (const questionId in correctAnswers) {
                if (correctAnswers.hasOwnProperty(questionId)) {
                    const expectedAnswer = String(correctAnswers[questionId]).toLowerCase(); // Ensure string and lowercase for comparison
                    const userAnswer = String(userAnswers[questionId] || '').toLowerCase(); // Get user's answer, default to empty string if not answered

                    // Apply feedback to specific question types (e.g., option cards, drop targets, inputs)
                    let questionElement = document.getElementById(questionId); // For inputs/selects
                    let dropTargetElement = null; // For drag and drop targets
                    
                    // Determine if it's a Part 1 drag-and-drop question based on the key structure
                    const isPart1Question = (
                        questionId === 'girl_in_tent_yellow_shirt' ||
                        questionId === 'boy_on_red_bike' ||
                        questionId === 'boy_with_map' ||
                        questionId === 'girl_with_sticks' ||
                        questionId === 'girl_reading_book' ||
                        questionId === 'boy_by_fire' ||
                        questionId === 'girl_fishing_net'
                    );

                    // Clear all existing Part 1 feedback for a fresh check (global clear for drag-and-drop)
                    if (isPart1Question) {
                        // Only target the specific drop zone for direct feedback
                        dropTargetElement = document.querySelector(`.drop-target[data-description="${questionId}"]`);
                        if (dropTargetElement) {
                            dropTargetElement.classList.remove('correct', 'incorrect');
                            dropTargetElement.style.borderColor = ''; // Clear any direct style
                            dropTargetElement.style.backgroundColor = '';
                        }
                        // Clear feedback from ALL draggable names
                        document.querySelectorAll('.draggable-name').forEach(nameDiv => {
                            nameDiv.classList.remove('correct', 'incorrect');
                        });
                        // Clear feedback from ALL *relevant* drop targets (those that are part of the answers)
                        // This prevents old feedback from lingering if an answer was moved
                        const allPart1DropTargets = [
                            'girl_in_tent_yellow_shirt', 'boy_on_red_bike', 'boy_with_map',
                            'girl_with_sticks', 'girl_reading_book', 'boy_by_fire', 'girl_fishing_net'
                        ];
                        allPart1DropTargets.forEach(targetDesc => {
                            const targetEl = document.querySelector(`.drop-target[data-description="${targetDesc}"]`);
                            if (targetEl) {
                                targetEl.classList.remove('correct', 'incorrect');
                                targetEl.style.borderColor = '';
                                targetEl.style.backgroundColor = '';
                            }
                        });


                    } else if (questionElement && questionElement.classList.contains('option-card')) {
                        // For Part 4, clear previous feedback for all options in that question group
                        document.querySelectorAll(`.option-card[data-question="${questionId}"]`).forEach(card => {
                            card.classList.remove('selected'); // Also clear selected state
                            card.classList.remove('correct', 'incorrect');
                        });
                    } else if (questionElement && (questionElement.tagName === 'INPUT' || questionElement.tagName === 'SELECT')) {
                        // For Part 2 or Part 5 inputs/selects, clear previous feedback
                        questionElement.style.borderColor = ''; // Reset border
                    }


                    if (userAnswer === expectedAnswer) {
                        correctCount++;
                        if (isPart1Question && dropTargetElement) {
                            dropTargetElement.classList.add('correct');
                            // Also apply 'correct' to the draggable name if it was placed correctly
                            const currentDraggableForThisTarget = document.querySelector(`.draggable-name[data-name="${userAnswers[questionId]}"]`);
                            if (currentDraggableForThisTarget) {
                                currentDraggableForThisTarget.classList.add('correct');
                            }
                        } else if (questionElement && questionElement.classList.contains('option-card')) {
                            questionElement.classList.add('correct');
                        } else if (questionElement && (questionElement.tagName === 'INPUT' || questionElement.tagName === 'SELECT')) {
                            questionElement.style.borderColor = '#4caf50'; // Green border
                        }
                    } else { // User answer is incorrect or not provided
                        if (isPart1Question && dropTargetElement) {
                            dropTargetElement.classList.add('incorrect');
                            // Mark the dropped name as incorrect if it was placed there
                            const currentDraggableForThisTarget = document.querySelector(`.draggable-name[data-name="${userAnswers[questionId]}"]`);
                            if (currentDraggableForThisTarget) {
                                currentDraggableForThisTarget.classList.add('incorrect');
                            }
                            // Highlight the correct draggable name by adding 'correct' class to it
                            const correctDraggableNameId = correctAnswers[questionId];
                            const correctDraggable = document.querySelector(`.draggable-name[data-name="${correctDraggableNameId}"]`);
                            if (correctDraggable) {
                                correctDraggable.classList.add('correct'); 
                            }
                        } else if (questionElement && questionElement.classList.contains('option-card')) {
                            questionElement.classList.add('incorrect');
                            // Highlight the correct answer
                            const correctAnswerCard = document.querySelector(`.option-card[data-question="${questionId}"][data-answer="${correctAnswers[questionId]}"]`);
                            if (correctAnswerCard) {
                                correctAnswerCard.classList.add('correct'); // Mark the correct one
                            }
                        } else if (questionElement && (questionElement.tagName === 'INPUT' || questionElement.tagName === 'SELECT')) {
                            questionElement.style.borderColor = '#f44336'; // Red border
                        }
                    }
                }
            }

            // Display final score
            const percentage = (correctCount / totalQuestions) * 100;
            let resultClass = '';
            if (percentage === 100) {
                resultClass = 'correct';
            } else if (percentage >= 50) {
                resultClass = 'partial';
            } else {
                resultClass = 'incorrect';
            }

            finalResultsDisplay.innerHTML = `<p>You scored ${correctCount} out of ${totalQuestions} (${percentage.toFixed(0)}%).</p>`;
            finalResultsDisplay.className = resultClass; // Set class for styling
            console.log(`Final Score: ${correctCount}/${totalQuestions}`);
        });
    }

    // --- Initial setup: Show the introduction section when the page loads ---
    showSection('listening-intro');
});
