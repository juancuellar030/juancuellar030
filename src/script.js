document.addEventListener('DOMContentLoaded', () => {

    const correctAnswers = {
        q1: 'B',
        q2: 'A'
    };

    const questionBlocks = document.querySelectorAll('.question-block:not(#q0)');
    const checkAnswersBtn = document.getElementById('check-answers-btn');
    const resultsDisplay = document.getElementById('results-display');
    
    // Store user's selections
    const userSelections = {};

    questionBlocks.forEach(block => {
        const questionId = block.id;
        const options = block.querySelectorAll('.option-card');

        options.forEach(option => {
            option.addEventListener('click', () => {
                // Remove 'selected' class from sibling options
                options.forEach(opt => opt.classList.remove('selected'));
                
                // Add 'selected' class to the clicked option
                option.classList.add('selected');
                
                // Store the selection
                userSelections[questionId] = option.dataset.answer;
            });
        });
    });

    checkAnswersBtn.addEventListener('click', () => {
        let score = 0;
        let answeredQuestions = 0;

        // Reset previous feedback styles
        document.querySelectorAll('.option-card').forEach(opt => {
            opt.classList.remove('correct', 'incorrect');
        });

        for (const questionId in correctAnswers) {
            const block = document.getElementById(questionId);
            const correctAnswer = correctAnswers[questionId];
            const selectedAnswer = userSelections[questionId];
            
            if (selectedAnswer) {
                answeredQuestions++;
                const selectedOptionCard = block.querySelector(`.option-card[data-answer="${selectedAnswer}"]`);
                const correctOptionCard = block.querySelector(`.option-card[data-answer="${correctAnswer}"]`);

                if (selectedAnswer === correctAnswer) {
                    score++;
                    selectedOptionCard.classList.add('correct');
                } else {
                    selectedOptionCard.classList.add('incorrect');
                    correctOptionCard.classList.add('correct'); // Also show the correct answer
                }
            }
        }
        
        // Disable the button after checking
        checkAnswersBtn.disabled = true;

        // Display results
        resultsDisplay.textContent = `You scored ${score} out of ${Object.keys(correctAnswers).length}.`;
        if (score === Object.keys(correctAnswers).length) {
            resultsDisplay.className = 'correct';
        } else if (score > 0) {
            resultsDisplay.className = 'partial';
        } else {
            resultsDisplay.className = 'incorrect';
        }
    });
});