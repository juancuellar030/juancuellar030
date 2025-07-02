// --- UPGRADED CUSTOM AUDIO PLAYER LOGIC ---
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}
function setupCustomPlayer(playerId) {
    const audio = document.getElementById(`audio-source-${playerId}`);
    const playPauseBtn = document.getElementById(`play-pause-btn-${playerId}`);
    const seekForwardBtn = document.getElementById(`seek-forward-btn-${playerId}`);
    const seekBackwardBtn = document.getElementById(`seek-backward-btn-${playerId}`);
    const volumeSlider = document.getElementById(`volume-slider-${playerId}`);
    const currentTimeEl = document.getElementById(`current-time-${playerId}`);
    const totalDurationEl = document.getElementById(`total-duration-${playerId}`);
    if (!audio || !playPauseBtn || !currentTimeEl || !totalDurationEl) return;
    const playIcon = playPauseBtn.querySelector('.fa-play');
    const pauseIcon = document.createElement('i');
    pauseIcon.className = 'fas fa-pause';
    const progressBarWrapper = playPauseBtn.closest('.custom-audio-player').querySelector('.progress-bar-wrapper');
    const progressBar = progressBarWrapper.querySelector('.progress-bar');
    playPauseBtn.addEventListener('click', () => { if (audio.paused) { audio.play(); } else { audio.pause(); } });
    audio.addEventListener('play', () => { playPauseBtn.innerHTML = ''; playPauseBtn.appendChild(pauseIcon); });
    audio.addEventListener('pause', () => { playPauseBtn.innerHTML = ''; playPauseBtn.appendChild(playIcon); });
    if (seekForwardBtn && seekBackwardBtn) {
        seekForwardBtn.addEventListener('click', () => { audio.currentTime += 15; });
        seekBackwardBtn.addEventListener('click', () => { audio.currentTime -= 15; });
    }
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => { audio.volume = e.target.value / 100; });
    }
    audio.addEventListener('timeupdate', () => { if (audio.duration) { const progressPercent = (audio.currentTime / audio.duration) * 100; progressBar.style.width = `${progressPercent}%`; currentTimeEl.textContent = formatTime(audio.currentTime); } });
    audio.addEventListener('loadedmetadata', () => { totalDurationEl.textContent = formatTime(audio.duration); });
    progressBarWrapper.addEventListener('click', (e) => { if (audio.duration) { const wrapperWidth = progressBarWrapper.offsetWidth; const clickPosition = e.offsetX; const seekTime = (clickPosition / wrapperWidth) * audio.duration; audio.currentTime = seekTime; } });
}


// ==========================================================
//          MAIN SCRIPT LOGIC STARTS HERE
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Get User Name from URL ---
    const params = new URLSearchParams(window.location.search);
    const userName = params.get('name') || 'Anonymous'; 

    // --- State and Correct Answers ---
    let userAnswers = {};
    const correctAnswers = {
        'boy_on_rock_magazine': 'michael', 'girl_jumping_stream': 'sophia', 'boy_on_bike_helmet': 'oliver',
        'girl_by_fire': 'emma', 'boy_in_cave_torch': 'robert', 'girl_on_tablet_no_shoes': 'katy',
        'q2_q1': 'badger', 'q2_q2': 'telephone', 'q2_q3': '24', 'q2_q4': 'wednesday', 'q2_q5': 'glue',
        'q3_bracelet': 'A', 'q3_soap': 'G', 'q3_belt': 'B', 'q3_scissors': 'F', 'q3_letter': 'D',
        'q4_q1': 'C', 'q4_q2': 'B', 'q4_q3': 'C', 'q4_q4': 'A', 'q4_q5': 'B',
        'glove-shape': 'orange', 'butterfly-shape': 'red', 'drum-text-area': 'frank',
        'poster-text-area': 'sleep', 'flag-shape': 'purple',
    };

    // --- Core navigation logic ---
    const testSections = document.querySelectorAll('.test-section');
    function showSection(sectionId) {
        testSections.forEach(section => {
            section.classList.toggle('active', section.id === sectionId);
            section.classList.toggle('hidden', section.id !== sectionId);
        });
        document.querySelectorAll('audio').forEach(p => p.pause());
        if (sectionId === 'listening-part5') {
            loadPart5Svg();
        }
        document.querySelector('.test-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // --- Main click handler (Simplified) ---
    document.body.addEventListener('click', (event) => {
        const button = event.target.closest('.nav-btn, .restart-btn');
        if (button && button.dataset.target) {
            showSection(button.dataset.target);
        }
    });

    // --- Drag and Drop Logic ---
    let draggedItem = null;
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
            const droppedName = draggedItem.dataset.name;
            const targetZoneId = target.dataset.description;
            for (const key in userAnswers) {
                if (userAnswers[key] === droppedName) delete userAnswers[key];
            }
            if (targetZoneId) userAnswers[targetZoneId] = droppedName;
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

    // ==========================================================
    //          UPGRADED PART 5 LOGIC (Coloring & Eraser)
    // ==========================================================
    let activeTool = { type: null, value: null };
    const interactiveContainer = document.getElementById('part5-interactive-container');
    let svgLoaded = false;
    const OUTLINE_COLOR_RGB = 'rgb(58, 40, 45)'; // This is the RGB value for #3a282d
    
    /**
     * Fetches the SVG, injects it, and stores the original color of every shape.
     */
    function loadPart5Svg() {
        if (svgLoaded) return;
        fetch('images/part5_interactive.svg')
            .then(response => response.text())
            .then(svgData => {
                interactiveContainer.innerHTML = svgData;
                const svg = interactiveContainer.querySelector('svg');
                if (svg) {
                    // IMPORTANT: Store the original color of every shape
                    svg.querySelectorAll('path, rect, polygon, circle, ellipse').forEach(shape => {
                        shape.dataset.originalColor = window.getComputedStyle(shape).fill;
                    });
                    svg.addEventListener('click', handleSvgClick);
                }
                svgLoaded = true;
            });
    }
    
    /**
     * Handles clicks inside the SVG container.
     */
    function handleSvgClick(e) {
        // Target any shape the user clicks on
        const targetShape = e.target.closest('path, rect, polygon, circle, ellipse');
        if (!targetShape) return;
    
        // --- The Fix for Ignoring Outlines ---
        // Get the computed fill color and check if it's the outline color
        const currentFill = window.getComputedStyle(targetShape).fill;
        if (currentFill === OUTLINE_COLOR_RGB) {
            return; // Stop the function if the user clicks on an outline
        }
    
        // Check if a tool is active
        if (!activeTool.type) {
            alert("Please select a color or the 'Write' tool first!");
            return;
        }
    
        const shapeId = targetShape.id; // Get the ID for answer saving
    
        if (activeTool.type === 'eraser') {
            // --- The Fix for the "Smarter Eraser" ---
            // Revert to the stored original color
            targetShape.style.fill = targetShape.dataset.originalColor || '';
            if (shapeId) {
                delete userAnswers[shapeId];
                const text = document.getElementById(`text-for-${shapeId}`);
                if (text) text.remove();
            }
        } else if (activeTool.type === 'color') {
            targetShape.style.fill = activeTool.value;
            if (shapeId) userAnswers[shapeId] = activeTool.value;
        } else if (activeTool.type === 'write') {
            if (shapeId) {
                const textToWrite = prompt("What word do you want to write?");
                if (textToWrite && textToWrite.trim()) {
                    userAnswers[shapeId] = textToWrite.trim().toLowerCase();
                    // ... (The rest of your existing logic for adding text is fine)
                    const oldText = document.getElementById(`text-for-${shapeId}`);
                    if (oldText) oldText.remove();
                    const bbox = targetShape.getBBox();
                    const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    Object.assign(textElement, { id: `text-for-${shapeId}`, textContent: textToWrite.toUpperCase() });
                    Object.assign(textElement.style, { pointerEvents: 'none', fill: 'black', textAnchor: 'middle', alignmentBaseline: 'middle' });
                    textElement.setAttribute("x", bbox.x + bbox.width / 2);
                    textElement.setAttribute("y", bbox.y + bbox.height / 2);
                    textElement.setAttribute("font-size", "16");
                    targetShape.parentNode.appendChild(textElement);
                }
            } else {
                alert("You can't write text on this object.");
            }
        }
    }
    
    // --- Tool Selection Listeners (These can remain as they are) ---
    document.querySelector('.color-palette')?.addEventListener('click', (e) => { if (e.target.classList.contains('palette-color')) { document.querySelectorAll('.palette-color, .write-tool, .eraser-tool').forEach(el => el.classList.remove('selected')); e.target.classList.add('selected'); activeTool = { type: 'color', value: e.target.dataset.color }; } });
    document.getElementById('write-tool-btn')?.addEventListener('click', (e) => { document.querySelectorAll('.palette-color, .write-tool, .eraser-tool').forEach(el => el.classList.remove('selected')); e.currentTarget.classList.add('selected'); activeTool = { type: 'write', value: null }; });
    document.getElementById('eraser-tool-btn')?.addEventListener('click', (e) => { document.querySelectorAll('.palette-color, .write-tool, .eraser-tool').forEach(el => el.classList.remove('selected')); e.currentTarget.classList.add('selected'); activeTool = { type: 'eraser', value: null }; });

    // --- Google Forms Submission ---
    function submitResultsToGoogle(score) {
        const googleFormURL = 'https://script.google.com/macros/s/AKfycbz6pQLL3HfqhZVLnOlivAob2GM3961XOnxRcgCPdHaCJTYTjUBe-ShR-6pITWnHQoU/exec'; 
        const formData = new FormData();
        formData.append('name', userName);
        formData.append('score', score);
        formData.append('testType', 'Listening');
        fetch(googleFormURL, { method: 'POST', body: formData }).then(r => r.json()).then(d => console.log(d)).catch(e => console.error(e));
    }

    // --- Final Grading Logic ---
    document.getElementById('check-all-listening-answers-btn').addEventListener('click', () => {
        let correctCount = 0;
        const questionsToGrade = Object.keys(correctAnswers).filter(qId => 
            !qId.includes('example') && qId !== 'boy_on_rock_magazine'
        );
        const totalRealQuestions = questionsToGrade.length;
    
        // --- Start of Grading Loop ---
        questionsToGrade.forEach(qId => {
            const userAnswer = (userAnswers[qId] || 'No Answer').trim().toLowerCase();
            const correctAnswer = correctAnswers[qId];
    
            // Part 1: Drag and Drop
            if (qId.endsWith('_shoes') || qId.endsWith('_torch') || qId.endsWith('_fire') || qId.endsWith('_helmet') || qId.endsWith('_stream')) {
                if (userAnswer === correctAnswer) correctCount++;
            }
            // Part 2: Text Input
            else if (qId.startsWith('q2_')) {
                if (userAnswer === correctAnswer || (qId === 'q2_q3' && userAnswer === 'twenty-four')) correctCount++;
            }
            // Part 3: Letter Matching
            else if (qId.startsWith('q3_')) {
                if (userAnswer.toUpperCase() === correctAnswer) correctCount++;
            }
            // Part 4: Multiple Choice
            else if (qId.startsWith('q4_')) {
                // Case-insensitive comparison for Part 4
                if (userAnswer.toUpperCase() === correctAnswer.toUpperCase()) correctCount++;
            }
            // Part 5: Interactive
            else if (qId.endsWith('-shape') || qId.endsWith('-area')) {
                if (userAnswer === correctAnswer) correctCount++;
            }
        });
        // --- End of Grading Loop ---
    
        // --- Display Results ---
        const finalResultsDisplay = document.getElementById('final-results-display');
        const percentage = (totalRealQuestions > 0) ? (correctCount / totalRealQuestions) * 100 : 0;
        
        let resultsHTML = '';
        if (userName) resultsHTML += `<h3>Results for: ${userName}</h3>`;
        resultsHTML += `<p>You scored ${correctCount} out of ${totalRealQuestions} (${percentage.toFixed(0)}%).</p>`;
        
        finalResultsDisplay.innerHTML = resultsHTML;
        finalResultsDisplay.className = percentage === 100 ? 'correct' : (percentage >= 50 ? 'partial' : 'incorrect');
        
        // --- Submit to Google ---
        submitResultsToGoogle(`${correctCount}/${totalRealQuestions}`);
    });

    // --- INITIAL PAGE SETUP ---
    // This is the clean way to start the test
    function initializeTest() {
        // Reset everything to a clean state
        userAnswers = {};
        document.querySelectorAll('.correct, .incorrect, .selected').forEach(el => el.classList.remove('correct', 'incorrect', 'selected'));
        document.querySelectorAll('input, select').forEach(input => input.style.borderColor = '');
        document.querySelectorAll('.draggable-name').forEach(nameEl => {
            const poolId = ['katy', 'robert', 'oliver'].includes(nameEl.dataset.name) ? 'names-pool-top' : 'names-pool-bottom';
            document.getElementById(poolId).appendChild(nameEl);
        });

        // Set up the example for Part 1
        const michaelElement = document.querySelector('.draggable-name[data-name="michael"]');
        const michaelTargetZone = document.querySelector('.drop-target[data-description="boy_on_rock_magazine"]');
        if (michaelElement && michaelTargetZone) {
            michaelTargetZone.appendChild(michaelElement);
        }
        
        // Make Part 1 the visible section
        showSection('listening-part1');
    }

    initializeTest(); // Run the setup function when the page loads

    // Set up all audio players
    setupCustomPlayer('part1');
    setupCustomPlayer('part2');
    setupCustomPlayer('part3');
    setupCustomPlayer('part4');
    setupCustomPlayer('part5');
});
