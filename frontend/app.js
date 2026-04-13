document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('checkForm');
    const btnText = form.querySelector('button span');
    const loader = form.querySelector('.loader');
    const resultDiv = document.getElementById('result');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Gather data
        const name = document.getElementById('name').value;
        const age = document.getElementById('age').value;
        const gender = document.getElementById('gender').value;

        // 2. UI Loading State
        btnText.classList.add('hidden');
        loader.classList.remove('hidden');
        form.querySelector('button').disabled = true;
        resultDiv.classList.add('hidden');

        try {
            // 3. Fetch from API (Backend is assumed to run on localhost:3000)
            const response = await fetch('http://localhost:3000/api/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, age, gender })
            });

            const data = await response.json();

            // 4. Update UI with result
            resultDiv.classList.remove('hidden', 'success', 'error');
            
            if (response.ok) {
                if (data.exists) {
                    resultDiv.classList.add('success');
                    resultDiv.innerHTML = `
                        <div class="result-icon">🎉</div>
                        <div class="result-message">Perfect Match! We found <strong>${data.user.name}</strong> in the database.</div>
                    `;
                } else {
                    resultDiv.classList.add('error');
                    resultDiv.innerHTML = `
                        <div class="result-icon">🕵️</div>
                        <div class="result-message">No record found for the provided details.</div>
                    `;
                }
            } else {
                resultDiv.classList.add('error');
                resultDiv.innerHTML = `
                    <div class="result-icon">⚠️</div>
                    <div class="result-message">${data.error || "Something went wrong."}</div>
                `;
            }

        } catch (error) {
            console.error("Error connecting to backend:", error);
            resultDiv.classList.remove('hidden', 'success');
            resultDiv.classList.add('error');
            resultDiv.innerHTML = `
                <div class="result-icon">🔌</div>
                <div class="result-message">Cannot connect to the server. Is the backend running?</div>
            `;
        } finally {
            // Revert Loading State
            btnText.classList.remove('hidden');
            loader.classList.add('hidden');
            form.querySelector('button').disabled = false;
        }
    });
});
