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

        // Extract text as a single string
        const pageText = textContent.items.map(item => item.str).join(' ');

        // Log extracted text for debugging
        console.log(`Page ${i} Content:`, pageText);

        // Update matching logic if necessary
        const extractedQuestions = pageText.match(/^\d+[.)]?\s.+$/gm);
        if (extractedQuestions) {
            questions = questions.concat(extractedQuestions);
        }
    }

    if (questions.length > 0) {
        generateQuiz(questions);
    } else {
        alert('No questions found in the PDF. Check console logs to debug.');
    }
}


function generateQuiz(questions) {
    const container = document.getElementById('quiz-container');
    container.innerHTML = '';
    questions.forEach((question, index) => {
        const div = document.createElement('div');
        div.className = 'quiz-question';
        div.innerHTML = `
            <p>${index + 1}. ${question}</p>
            <label><input type="radio" name="q${index}" value="A"> A</label>
            <label><input type="radio" name="q${index}" value="B"> B</label>
            <label><input type="radio" name="q${index}" value="C"> C</label>
            <label><input type="radio" name="q${index}" value="D"> D</label>
        `;
        container.appendChild(div);
    });

    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn';
    submitBtn.textContent = 'Submit';
    submitBtn.onclick = () => {
        alert('Quiz submitted! Scoring will be implemented later.');
    };
    container.appendChild(submitBtn);
}
