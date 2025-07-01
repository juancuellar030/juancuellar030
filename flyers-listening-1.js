document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================
    //          1. ALL SETUP AND HELPER FUNCTIONS
    // ==========================================================

    // --- Custom Audio Player Logic ---
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    function setupCustomPlayer(playerId) {
        // Find all the elements for this specific player
        const playerWrapper = document.getElementById(`player-${playerId}`);
        if (!playerWrapper) return; // If this player doesn't exist on the page, stop.
    
        const audio = playerWrapper.querySelector(`#audio-source-${playerId}`);
        const playPauseBtn = playerWrapper.querySelector(`#play-pause-btn-${playerId}`);
        const currentTimeEl = playerWrapper.querySelector(`#current-time-${playerId}`);
        const totalDurationEl = playerWrapper.querySelector(`#total-duration-${playerId}`);
        const progressBarWrapper = playerWrapper.querySelector('.progress-bar-wrapper');
        const progressBar = playerWrapper.querySelector('.progress-bar');
        
        // If any essential element is missing, stop to prevent errors
        if (!audio || !playPauseBtn || !currentTimeEl || !totalDurationEl || !progressBarWrapper) {
            return;
        }
    
        const playIcon = playPauseBtn.querySelector('.fa-play');
        const pauseIcon = playPauseBtn.querySelector('.fa-pause');
    
        // --- Main Play/Pause Button Functionality ---
        playPauseBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
            }
        });
    
        // --- Icon Swapping ---
        audio.addEventListener('play', () => {
            if (playIcon) playIcon.style.display = 'none';
            if (pauseIcon) pauseIcon.style.display = 'block';
        });
    
        audio.addEventListener('pause', () => {
            if (pauseIcon) pauseIcon.style.display = 'none';
            if (playIcon) playIcon.style.display = 'block';
        });
    
        // --- Time and Progress Bar Updates ---
        audio.addEventListener('loadedmetadata', () => {
            totalDurationEl.textContent = formatTime(audio.duration);
        });
    
        audio.addEventListener('timeupdate', () => {
            if (audio.duration) {
                progressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
                currentTimeEl.textContent = formatTime(audio.currentTime);
            }
        });
    
        // --- Seek Functionality ---
        progressBarWrapper.addEventListener('click', (e) => {
            if (audio.duration) {
                const wrapperWidth = progressBarWrapper.offsetWidth;
                const clickPosition = e.offsetX;
                audio.currentTime = (clickPosition / wrapperWidth) * audio.duration;
            }
        });
    }
    // --- Core navigation logic ---
    function showSection(sectionId) {
        document.querySelectorAll('.test-section').forEach(section => {
            section.classList.toggle('active', section.id === sectionId);
            section.classList.toggle('hidden', section.id !== sectionId);
        });
        document.querySelectorAll('audio').forEach(p => p.pause());
        if (sectionId === 'listening-part5') loadPart5Svg();
        if (sectionId === 'listening-intro') resetAllAnswers();
        document.querySelector('.test-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // --- Interactive Part 5 Logic ---
    function loadPart5Svg() {
        if (svgLoaded) return;
        fetch('images/part5_interactive.svg')
            .then(r => r.text())
            .then(svgData => {
                interactiveContainer.innerHTML = svgData;
                interactiveContainer.querySelector('svg')?.addEventListener('click', handleSvgClick);
                svgLoaded = true;
            });
    }
    function handleSvgClick(e) { /* Your full handleSvgClick logic is fine */ }
    
    // --- Reset and Submission Logic ---
    function resetAllAnswers() { /* Your full reset logic is fine */ }
    function submitResultsToGoogle(name, score) { /* Your submission logic is fine */ }


    // ==========================================================
    //          2. ALL STATE VARIABLES AND CONSTANTS
    // ==========================================================
    
    let userName = ''; 
    let userAnswers = {};
    let activeTool = { type: null, value: null };
    let svgLoaded = false;
    let draggedItem = null;
    
    const nameInput = document.getElementById('user-name-input');
    const startButton = document.querySelector('.start-test-btn');
    const interactiveContainer = document.getElementById('part5-interactive-container');
    const correctAnswers = { /* Your correct answers object is fine */ };

    // ==========================================================
    //          3. ALL EVENT LISTENERS
    // ==========================================================

    // --- Main Page Listeners ---
    nameInput.addEventListener('input', () => {
        startButton.disabled = nameInput.value.trim() === '';
    });
    document.body.addEventListener('click', (event) => {
        const button = event.target.closest('.nav-btn, .start-test-btn, .restart-btn');
        if (button) {
            if (button.classList.contains('start-test-btn')) userName = nameInput.value.trim();
            showSection(button.dataset.target);
        }
    });

    // --- Drag and Drop Listeners ---
    document.querySelectorAll('.draggable-name').forEach(draggable => {
        draggable.addEventListener('dragstart', (e) => { draggedItem = e.target; setTimeout(() => e.target.classList.add('dragging'), 0); });
        draggable.addEventListener('dragend', () => { draggedItem?.classList.remove('dragging'); draggedItem = null; });
    });
    document.querySelectorAll('.drop-target, .names-pool').forEach(target => {
        target.addEventListener('dragover', e => e.preventDefault());
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

    // --- Other Answer Saving Listeners ---
    document.querySelectorAll('#listening-part2 .text-answer, #listening-part3 .letter-box').forEach(input => {
        input.addEventListener('input', (event) => { userAnswers[event.target.id] = event.target.value.trim().toLowerCase(); });
    });
    document.querySelectorAll('#listening-part4 .option-card').forEach(card => {
        card.addEventListener('click', () => { /* ... your part 4 saving logic is fine ... */ });
    });
    
    // --- Part 5 Tool Listeners ---
    document.querySelector('.color-palette')?.addEventListener('click', (e) => { /* ... */ });
    document.getElementById('write-tool-btn')?.addEventListener('click', (e) => { /* ... */ });
    document.getElementById('eraser-tool-btn')?.addEventListener('click', (e) => { /* ... */ });

    // --- Final Grading Listener ---
    document.getElementById('check-all-listening-answers-btn').addEventListener('click', () => {
        // ... The entire, correct grading logic from the previous step is fine ...
    });

    // ==========================================================
    //          4. INITIALIZATION
    // ==========================================================

    // Set up all audio players on the page
    document.querySelectorAll('.custom-audio-player').forEach(player => {
        const id = player.id.split('-').pop();
        setupCustomPlayer(id);
    });

    // Show the intro section to start the test
    showSection('listening-intro');

}); // <-- THE ONLY 'DOMContentLoaded' LISTENER NOW WRAPS THE ENTIRE SCRIPT
