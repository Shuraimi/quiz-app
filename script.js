async function processPDF() {
    const fileInput = document.getElementById('pdf');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please upload a PDF file.');
        return;
    }

    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    const loadingTask = pdfjsLib.getDocument(URL.createObjectURL(file));
    const pdf = await loadingTask.promise;

    let questions = [];
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        const pageText = textContent.items.map(item => item.str).join('\n');

        // Extract questions with numbering like 11.1.1 and answers
        const extractedLines = pageText.split('\n');
        extractedLines.forEach(line => {
            const match = line.match(/^(\d+\.\d+\.\d+)\s+(.+?)(Answer:\s*[A-D])?/);
            if (match) {
                const [_, id, question, answer] = match;
                questions.push({
                    id,
                    question: question.trim(),
                    correctAnswer: answer ? answer.split(':')[1].trim() : null
                });
            }
        });
    }

    if (questions.length > 0) {
        generateQuiz(questions);
    } else {
        alert('No questions found in the PDF. Check formatting or refine extraction logic.');
    }
}

function generateQuiz(questions) {
    const container = document.getElementById('quiz-container');
    container.innerHTML = '';

    questions.forEach((q, index) => {
        const div = document.createElement('div');
        div.className = 'quiz-question';
        div.innerHTML = `
            <p><strong>${q.id}:</strong> ${q.question}</p>
            <label>
                <input type="radio" name="q${index}" value="A" onclick="validateAnswer(${index}, 'A', '${q.correctAnswer}')">
                A
            </label>
            <label>
                <input type="radio" name="q${index}" value="B" onclick="validateAnswer(${index}, 'B', '${q.correctAnswer}')">
                B
            </label>
            <label>
                <input type="radio" name="q${index}" value="C" onclick="validateAnswer(${index}, 'C', '${q.correctAnswer}')">
                C
            </label>
            <label>
                <input type="radio" name="q${index}" value="D" onclick="validateAnswer(${index}, 'D', '${q.correctAnswer}')">
                D
            </label>
            <p id="result-${index}" class="result"></p>
        `;
        container.appendChild(div);
    });
}
function validateAnswer(questionIndex, selectedOption, correctAnswer) {
    const resultElement = document.getElementById(`result-${questionIndex}`);
    if (selectedOption === correctAnswer) {
        resultElement.innerHTML = '<span style="color: green; font-weight: bold;">Correct!</span>';
    } else {
        resultElement.innerHTML = `<span style="color: red; font-weight: bold;">Wrong! The correct answer is ${correctAnswer}.</span>`;
    }
}

