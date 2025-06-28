// --- UPGRADED CUSTOM AUDIO PLAYER LOGIC ---

// Helper function to format time from seconds to MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function setupCustomPlayer(playerId) {
    // Get all the new elements
    const audio = document.getElementById(`audio-source-${playerId}`);
    const playPauseBtn = document.getElementById(`play-pause-btn-${playerId}`);
    const seekForwardBtn = document.getElementById(`seek-forward-btn-${playerId}`);
    const seekBackwardBtn = document.getElementById(`seek-backward-btn-${playerId}`);
    const volumeSlider = document.getElementById(`volume-slider-${playerId}`);
    const currentTimeEl = document.getElementById(`current-time-${playerId}`);
    const totalDurationEl = document.getElementById(`total-duration-${playerId}`);
    
    // Check if essential elements exist before proceeding
    if (!audio || !playPauseBtn || !currentTimeEl || !totalDurationEl) return;

    const playIcon = playPauseBtn.querySelector('.fa-play');
    const pauseIcon = document.createElement('i');
    pauseIcon.className = 'fas fa-pause';

    const progressBarWrapper = playPauseBtn.closest('.custom-audio-player').querySelector('.progress-bar-wrapper');
    const progressBar = progressBarWrapper.querySelector('.progress-bar');
    
    // --- Event Listeners ---

    // Play/Pause button
    playPauseBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    });
    
    // Event listener for when the audio starts/stops playing
    audio.addEventListener('play', () => {
        playPauseBtn.innerHTML = '';
        playPauseBtn.appendChild(pauseIcon);
    });
    audio.addEventListener('pause', () => {
        playPauseBtn.innerHTML = '';
        playPauseBtn.appendChild(playIcon);
    });

    // Seek buttons
    if (seekForwardBtn && seekBackwardBtn) {
        seekForwardBtn.addEventListener('click', () => {
            audio.currentTime += 15;
        });
        seekBackwardBtn.addEventListener('click', () => {
            audio.currentTime -= 15;
        });
    }

    // Volume slider
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            audio.volume = e.target.value / 100;
        });
    }

    // Update time displays and progress bar
    audio.addEventListener('timeupdate', () => {
        if (audio.duration) { // Check if duration is available
            const progressPercent = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
            currentTimeEl.textContent = formatTime(audio.currentTime);
        }
    });

    // Set total duration once audio metadata is loaded
    audio.addEventListener('loadedmetadata', () => {
        totalDurationEl.textContent = formatTime(audio.duration);
    });

    // Allow user to click on progress bar to seek
    progressBarWrapper.addEventListener('click', (e) => {
        if (audio.duration) { // Check if duration is available
            const wrapperWidth = progressBarWrapper.offsetWidth;
            const clickPosition = e.offsetX;
            const seekTime = (clickPosition / wrapperWidth) * audio.duration;
            audio.currentTime = seekTime;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // --- Select all necessary elements (reverting changes) ---
    const nameInput = document.getElementById('user-name-input');
    const startButton = document.querySelector('.start-test-btn');
    const testSections = document.querySelectorAll('.test-section');
    
    // --- State variables (reverting changes) ---
    let userName = ''; 
    let userAnswers = {}; 

    const correctAnswers = {
        'boy_on_rock_magazine': 'michael', 'girl_jumping_stream': 'sophia', 'boy_on_bike_helmet': 'oliver',
        'girl_by_fire': 'emma', 'boy_in_cave_torch': 'robert', 'girl_on_tablet_no_shoes': 'katy',
        'q2_q1': 'badger', 'q2_q2': 'telephone', 'q2_q3': '24', 'q2_q4': 'wednesday', 'q2_q5': 'glue',
        'q3_bracelet': 'A', 'q3_soap': 'G', 'q3_belt': 'B', 'q3_scissors': 'F', 'q3_letter': 'D',
        'q4_example': 'A', 'q4_q1': 'C', 'q4_q2': 'B', 'q4_q3': 'C', 'q4_q4': 'A', 'q4_q5': 'B',
        'glove-shape': 'orange', 'butterfly-shape': 'red', 'drum-text-area': 'frank',
        'poster-text-area': 'sleep', 'flag-shape': 'purple',
    };

    // --- Enable start button ---
        nameInput.addEventListener('input', () => {
            startButton.disabled = nameInput.value.trim() === '';
            
        });
    
    // --- Core navigation logic ---
    function showSection(sectionId) {
        testSections.forEach(section => {
            section.classList.toggle('active', section.id === sectionId);
            section.classList.toggle('hidden', section.id !== sectionId);
        });
        
        document.querySelectorAll('audio').forEach(p => p.pause());
        
        if (sectionId === 'listening-part1') {
            const michaelElement = document.querySelector('.draggable-name[data-name="michael"]');
            const michaelTargetZone = document.querySelector('.drop-target[data-description="boy_on_rock_magazine"]');
            if (michaelElement && michaelTargetZone && michaelTargetZone.children.length === 0) {
                michaelTargetZone.appendChild(michaelElement);
                userAnswers['boy_on_rock_magazine'] = 'michael';
            }
        }
        if (sectionId === 'listening-part5') {
            loadPart5Svg();
        }
        if (sectionId === 'listening-intro') {
            resetAllAnswers();
        }
        
        document.querySelector('.test-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // --- Main click handler ---
    document.body.addEventListener('click', (event) => {
        const button = event.target.closest('.nav-btn, .start-test-btn, .restart-btn');
        if (button) {
            // This 'if' block is the part that gets restored
            if (button.classList.contains('start-test-btn')) {
                userName = nameInput.value.trim();
            }
            showSection(button.dataset.target);
        }
    });

    // --- FIXED: FULL DRAG AND DROP LOGIC IS NOW RESTORED ---
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
        target.addEventListener('dragover', e => {
            e.preventDefault();
            target.classList.add('drag-over');
        });
        target.addEventListener('dragleave', () => {
            target.classList.remove('drag-over');
        });
        target.addEventListener('drop', e => {
            e.preventDefault();
            target.classList.remove('drag-over');
            if (!draggedItem) return;

            const droppedName = draggedItem.dataset.name;
            const targetZoneId = target.dataset.description;

            for (const key in userAnswers) {
                if (userAnswers[key] === droppedName) {
                    delete userAnswers[key];
                }
            }
            if (targetZoneId && targetZoneId !== 'unassigned-names-pool') {
                userAnswers[targetZoneId] = droppedName;
            }

            const existingName = target.querySelector('.draggable-name');
            if (existingName) {
                document.getElementById('names-pool-bottom').appendChild(existingName);
            }
            target.appendChild(draggedItem);
        });
    });

    // --- Answer Saving Logic for other parts ---
    document.querySelectorAll('#listening-part2 .text-answer, #listening-part3 .letter-box').forEach(input => {
        input.addEventListener('input', (event) => {
            userAnswers[event.target.id] = event.target.value.trim().toLowerCase();
        });
    });
    document.querySelectorAll('#listening-part4 .option-card').forEach(card => {
        card.addEventListener('click', () => {
            const questionId = card.dataset.question;
            const answer = card.dataset.answer;
            document.querySelectorAll(`.option-card[data-question="${questionId}"]`).forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            userAnswers[questionId] = answer;
        });
    });

    // --- ADVANCED LOGIC FOR INTERACTIVE PART 5 ---
    let activeTool = { type: null, value: null };
    const interactiveContainer = document.getElementById('part5-interactive-container');
    let svgLoaded = false;
            
    function loadPart5Svg() {
        if (svgLoaded) return;
        fetch('images/part5_interactive.svg')
            .then(response => response.text())
            .then(svgData => {
                interactiveContainer.innerHTML = svgData;
                interactiveContainer.querySelector('svg')?.addEventListener('click', handleSvgClick);
                svgLoaded = true;
            });
    }

    document.querySelector('.color-palette')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('palette-color')) {
            document.querySelectorAll('.palette-color, .write-tool, .eraser-tool').forEach(el => el.classList.remove('selected'));
            e.target.classList.add('selected');
            activeTool = { type: 'color', value: e.target.dataset.color };
        }
    });
    document.getElementById('write-tool-btn')?.addEventListener('click', (e) => {
        document.querySelectorAll('.palette-color, .write-tool, .eraser-tool').forEach(el => el.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
        activeTool = { type: 'write', value: null };
    });
    document.getElementById('eraser-tool-btn')?.addEventListener('click', (e) => {
        document.querySelectorAll('.palette-color, .write-tool, .eraser-tool').forEach(el => el.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
        activeTool = { type: 'eraser', value: null };
    });
    
    function handleSvgClick(e) {
        const targetShape = e.target.closest('.interactive-target');
        if (!targetShape) return;
        const shapeId = targetShape.id;
        if (!activeTool.type) {
            alert("Please select a color or the 'Write' tool first!");
            return;
        }
        if (activeTool.type === 'eraser') {
            targetShape.style.fill = ''; 
            if (shapeId) {
                const existingText = document.getElementById(`text-for-${shapeId}`);
                if (existingText) existingText.remove();
                delete userAnswers[shapeId];
            }
        } 
        else if (activeTool.type === 'color') {
            targetShape.style.fill = activeTool.value;
            if (shapeId) userAnswers[shapeId] = activeTool.value;
        } 
        else if (activeTool.type === 'write') {
            if (shapeId) {
                const textToWrite = prompt("What word do you want to write?");
                if (textToWrite && textToWrite.trim() !== '') {
                    userAnswers[shapeId] = textToWrite.trim().toLowerCase();
                    const oldText = document.getElementById(`text-for-${shapeId}`);
                    if (oldText) oldText.remove();
                    const bbox = targetShape.getBBox();
                    const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    textElement.id = `text-for-${shapeId}`;
                    textElement.setAttribute("x", bbox.x + bbox.width / 2);
                    textElement.setAttribute("y", bbox.y + bbox.height / 2);
                    textElement.setAttribute("font-size", "16");
                    textElement.setAttribute("fill", "black");
                    textElement.setAttribute("text-anchor", "middle");
                    textElement.setAttribute("alignment-baseline", "middle");
                    textElement.style.pointerEvents = 'none';
                    textElement.textContent = textToWrite.toUpperCase();
                    targetShape.parentNode.appendChild(textElement);
                }
            } else {
                alert("You can't write text on this object.");
            }
        }
    }
    
    // --- Full Reset Logic ---
    function resetAllAnswers() {
        userAnswers = {};
        document.querySelectorAll('.correct, .incorrect').forEach(el => el.classList.remove('correct', 'incorrect'));
        document.querySelectorAll('.text-answer, .letter-box').forEach(input => {
            input.value = '';
            input.style.borderColor = '';
        });
        document.querySelectorAll('.option-card.selected').forEach(card => card.classList.remove('selected'));
        document.querySelectorAll('.draggable-name').forEach(nameEl => {
            const name = nameEl.dataset.name;
            if (['katy', 'robert', 'oliver'].includes(name)) {
                document.getElementById('names-pool-top').appendChild(nameEl);
            } else {
                document.getElementById('names-pool-bottom').appendChild(nameEl);
            }
        });
        document.querySelectorAll('#part5-interactive-container [id$="-shape"]').forEach(shape => {
            shape.style.fill = '';
        });
        document.querySelectorAll('#part5-interactive-container text').forEach(text => {
            text.remove();
        });
        document.querySelectorAll('.palette-color, .write-tool, .eraser-tool').forEach(el => el.classList.remove('selected'));
        activeTool = { type: null, value: null };
        const finalResultsDisplay = document.getElementById('final-results-display');
        if (finalResultsDisplay) {
            finalResultsDisplay.innerHTML = '';
            finalResultsDisplay.className = '';
        }
    }

        // --- Google Forms Submission ---
    function submitResultsToGoogle(score) { // 'name' parameter is no longer needed
        // This is the SAME URL from your R&W test script
        const googleFormURL = 'https://script.google.com/macros/s/AKfycbyP5Y0Sh5JJ-gDjP0X_-kKj_V0y0TcIqeL0Ku2VGKXFp7rk64RyZKwKeeX_BJSihUPU/exec'; 

        const formData = new FormData();
        // These names must match the e.parameter names in your Code.gs script
        formData.append('name', userName); // Uses the userName variable from the top of the script
        formData.append('score', score);
        formData.append('testType', 'Listening'); // To distinguish it from the R&W test

        fetch(googleFormURL, {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.result === 'success') {
                console.log('Listening test submission successful.');
            } else {
                console.error('Submission failed:', data);
            }
        })
        .catch(error => {
            console.error('Error submitting results:', error);
        });
    }

    // --- Final Grading Logic ---
    document.getElementById('check-all-listening-answers-btn').addEventListener('click', () => {
        let correctCount = 0;
        let detailedFeedback = [];
    
        const questionsToGrade = Object.keys(correctAnswers).filter(qId => 
            !qId.includes('example') && qId !== 'boy_on_rock_magazine'
        );
        const totalRealQuestions = questionsToGrade.length;

        document.querySelectorAll('.correct, .incorrect').forEach(el => el.classList.remove('correct', 'incorrect'));
        document.querySelectorAll('.text-answer, .letter-box').forEach(input => input.style.borderColor = '');
        document.querySelectorAll('.option-card').forEach(card => card.classList.remove('selected', 'correct', 'incorrect'));

        questionsToGrade.forEach(qId => {
            if (!qId.startsWith('q') && !qId.endsWith('-shape') && !qId.endsWith('-area')) {
                const targetZone = document.querySelector(`.drop-target[data-description="${qId}"]`);
                if (targetZone) { 
                    const droppedItem = targetZone.querySelector('.draggable-name');
                    const userAnswer = droppedItem ? droppedItem.dataset.name : 'No Answer';
                    if (userAnswer === correctAnswers[qId]) {
                        correctCount++;
                        targetZone.classList.add('correct');
                        if (droppedItem) droppedItem.classList.add('correct');
                    } else {
                        targetZone.classList.add('incorrect');
                        if (droppedItem) droppedItem.classList.add('incorrect');
                        const correctNameElement = document.querySelector(`.draggable-name[data-name="${correctAnswers[qId]}"]`);
                        if (correctNameElement) correctNameElement.classList.add('correct');
                    }
                }
            }
                
            else if (qId.startsWith('q2_') || qId.startsWith('q3_')) {
                const inputElement = document.getElementById(qId);
                if (inputElement) {
                    const userAnswer = (userAnswers[qId] || 'No Answer').trim().toLowerCase();
                    let isCorrect = false;

                    // Check Part 2 answers
                    if (qId.startsWith('q2_')) {
                        isCorrect = (qId === 'q2_q3' && (userAnswer === '24' || userAnswer === 'twenty-four')) || (userAnswer === correctAnswers[qId]);
                        if (!isCorrect) {
                            let expectedAnswer = (qId === 'q2_q3') ? "'24' or 'twenty-four'" : `'${correctAnswers[qId]}'`;
                            detailedFeedback.push(`Part 2, Question ${qId.slice(-1)}: Your answer "${userAnswer}" was incorrect. Correct: ${expectedAnswer}.`);
                        }
                    } 
                    // Check Part 3 answers
                    else if (qId.startsWith('q3_')) {
                        isCorrect = (userAnswer.toUpperCase() === correctAnswers[qId]);
                        if (!isCorrect) {
                            let itemName = qId.slice(3); // Extracts 'bracelet' from 'q3_bracelet'
                            detailedFeedback.push(`Part 3, Item ${itemName}: Your answer "${userAnswer.toUpperCase()}" was incorrect. Correct: '${correctAnswers[qId]}'.`);
                        }
                    }
        
                    // Apply feedback styles
                    if (isCorrect) {
                        correctCount++;
                        inputElement.style.borderColor = '#4caf50';
                    } else {
                        inputElement.style.borderColor = '#f44336';
                    }
                }
            }
            else if (qId.startsWith('q4_')) {
                const userAnswer = userAnswers[qId];
                const correctOption = document.querySelector(`.option-card[data-question="${qId}"][data-answer="${correctAnswers[qId]}"]`);
                if (correctOption) {
                    const selectedOption = document.querySelector(`.option-card[data-question="${qId}"][data-answer="${userAnswer}"]`);
                    if (userAnswer === correctAnswers[qId]) {
                        correctCount++;
                        if(selectedOption) selectedOption.classList.add('correct');
                    } else {
                        if(selectedOption) selectedOption.classList.add('incorrect');
                        correctOption.classList.add('correct');
                    }
                }
            }
            else if (qId.endsWith('-shape') || qId.endsWith('-area')) {
                const userAnswer = (userAnswers[qId] || 'No Answer').toLowerCase();
                if (userAnswer === correctAnswers[qId]) {
                    correctCount++;
                } else {
                    detailedFeedback.push(`Part 5, Item "${qId.split('-')[0]}": Your answer "${userAnswer}" was incorrect.`);
                }
            }
        });

        const finalResultsDisplay = document.getElementById('final-results-display');
        const percentage = (totalRealQuestions > 0) ? (correctCount / totalRealQuestions) * 100 : 0;
        let resultsHTML = '';
        if (userName) resultsHTML += `<h3>Results for: ${userName}</h3>`;
        resultsHTML += `<p>You scored ${correctCount} out of ${totalRealQuestions} (${percentage.toFixed(0)}%).</p>`;
        if (detailedFeedback.length > 0) {
            resultsHTML += `<div class="detailed-results"><h4>Review your answers:</h4><p>${detailedFeedback.join('<br>')}</p></div>`;
        }
        finalResultsDisplay.innerHTML = resultsHTML;
        finalResultsDisplay.className = percentage === 100 ? 'correct' : (percentage >= 50 ? 'partial' : 'incorrect');
        submitResultsToGoogle(userName, correctCount);
    });
    
    // Initial page setup
    showSection('listening-intro');

    // Set up the player for each part
    setupCustomPlayer('part1');
    setupCustomPlayer('part2');
    setupCustomPlayer('part3');
    setupCustomPlayer('part4');
    setupCustomPlayer('part5');
});
