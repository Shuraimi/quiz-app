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

        // Extract text content and combine into a single string
        const pageText = textContent.items.map(item => item.str).join(' ');

        // Log raw text to debug
        console.log(`Page ${i} Content:\n${pageText}`);

        // Regex to match questions and answers
        const questionRegex = /(\d+\.\d+\.\d+)\s+(.+?)(Answer:\s*[A-D])?/g;

        let match;
        while ((match = questionRegex.exec(pageText)) !== null) {
            const id = match[1];
            const question = match[2].trim();
            const answer = match[3] ? match[3].split(':')[1].trim() : null;

            questions.push({
                id,
                question,
                correctAnswer: answer,
            });
        }
    }

    if (questions.length > 0) {
        console.log("Extracted Questions:", questions);
        generateQuiz(questions);
    } else {
        alert('No questions found in the PDF. Check console logs for debug info.');
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
