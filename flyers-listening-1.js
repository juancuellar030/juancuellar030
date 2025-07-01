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
    // --- Selectors and State Variables ---
    const nameInput = document.getElementById('user-name-input');
    const startButton = document.querySelector('.start-test-btn');
    const testSections = document.querySelectorAll('.test-section');
    let userName = '';
    let userAnswers = {};
    let activeTool = { type: null, value: null };
    let svgLoaded = false;
    const interactiveContainer = document.getElementById('part5-interactive-container');

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
        if (sectionId === 'listening-part5') loadPart5Svg();
        if (sectionId === 'listening-intro') resetAllAnswers();
        document.querySelector('.test-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // --- Main click handler ---
    document.body.addEventListener('click', (event) => {
        const button = event.target.closest('.nav-btn, .start-test-btn, .restart-btn');
        if (button) {
            if (button.classList.contains('start-test-btn')) userName = nameInput.value.trim();
            showSection(button.dataset.target);
        }
    });

    // --- Drag and Drop Logic ---
    let draggedItem = null;
    document.querySelectorAll('.draggable-name').forEach(draggable => {
        draggable.addEventListener('dragstart', (e) => { draggedItem = e.target; setTimeout(() => e.target.classList.add('dragging'), 0); });
        draggable.addEventListener('dragend', () => { draggedItem?.classList.remove('dragging'); draggedItem = null; });
    });
    document.querySelectorAll('.drop-target, .names-pool').forEach(target => {
        target.addEventListener('dragover', e => e.preventDefault());
        target.addEventListener('dragleave', () => target.classList.remove('drag-over'));
        target.addEventListener('drop', e => {
            e.preventDefault();
            if (!draggedItem) return;
            const droppedName = draggedItem.dataset.name;
            const targetZoneId = target.dataset.description;
            for (const key in userAnswers) { if (userAnswers[key] === droppedName) delete userAnswers[key]; }
            if (targetZoneId && targetZoneId !== 'unassigned-names-pool') userAnswers[targetZoneId] = droppedName;
            const existingName = target.querySelector('.draggable-name');
            if (existingName) document.getElementById('names-pool-bottom').appendChild(existingName);
            target.appendChild(draggedItem);
        });
    });

    // --- Answer Saving Logic for other parts ---
    document.querySelectorAll('#listening-part2 .text-answer, #listening-part3 .letter-box').forEach(input => {
        input.addEventListener('input', (event) => { userAnswers[event.target.id] = event.target.value.trim().toLowerCase(); });
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

    // THIS IS THE NEW, CORRECT SVG CLICK HANDLER
    function handleSvgClick(e) {
        const targetShape = e.target.closest('path, rect, polygon');
        if (!targetShape) return;

        const OUTLINE_COLOR_RGB = 'rgb(58, 40, 45)'; // This is the RGB for #3A282D
        const style = window.getComputedStyle(targetShape);
        const fillColor = style.fill;

        if (fillColor === OUTLINE_COLOR_RGB) {
            return; // Ignore clicks on the dark outline color
        }
        
        const shapeId = targetShape.id;

        if (!activeTool.type) {
            alert("Please select a color or the 'Write' tool first!");
            return;
        }

        if (activeTool.type === 'eraser') {
            targetShape.style.fill = ''; // This removes the inline style, reverting the shape to its original state
            if (shapeId) {
                const existingText = document.getElementById(`text-for-${shapeId}`);
                if (existingText) existingText.remove();
                delete userAnswers[shapeId];
            }
        } else if (activeTool.type === 'color') {
            targetShape.style.fill = activeTool.value;
            if (shapeId) userAnswers[shapeId] = activeTool.value;
        } else if (activeTool.type === 'write') {
            if (shapeId) { // Can only write on shapes with an ID
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
    
    // --- RESET AND SUBMISSION ---
    function resetAllAnswers() { /* Your full reset logic is fine */ }
    function submitResultsToGoogle(name, score) { /* Your submission logic is fine */ }

    // --- Final Grading Logic ---
    document.getElementById('check-all-listening-answers-btn').addEventListener('click', () => {
        // ... The entire, correct grading logic from the previous step is fine ...
    });
    
    // Initial page setup
    showSection('listening-intro');
});

    // Set up all audio players
    setupCustomPlayer('part1');
    setupCustomPlayer('part2');
    setupCustomPlayer('part3');
    setupCustomPlayer('part4');
    setupCustomPlayer('part5');
});
