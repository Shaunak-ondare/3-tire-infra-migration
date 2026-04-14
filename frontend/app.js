document.addEventListener('DOMContentLoaded', () => {
    const apiBaseUrl = '/api/users';
    const form = document.getElementById('userForm');
    const submitButton = form.querySelector('button');
    const buttonText = submitButton.querySelector('span');
    const loader = submitButton.querySelector('.loader');
    const feedback = document.getElementById('feedback');
    const userList = document.getElementById('userList');
    const listState = document.getElementById('listState');
    const recordCount = document.getElementById('recordCount');
    const refreshBtn = document.getElementById('refreshBtn');

    function setSubmitting(isSubmitting) {
        submitButton.disabled = isSubmitting;
        buttonText.classList.toggle('hidden', isSubmitting);
        loader.classList.toggle('hidden', !isSubmitting);
    }

    function showFeedback(type, message) {
        feedback.className = `result-card ${type}`;
        feedback.textContent = message;
        feedback.classList.remove('hidden');
    }

    function renderUsers(users) {
        recordCount.textContent = users.length;

        if (!users.length) {
            listState.textContent = 'No users yet. Add one from the form to get started.';
            userList.innerHTML = '<div class="empty-state">Your database is empty right now.</div>';
            return;
        }

        listState.textContent = 'Latest records from the backend database.';
        userList.innerHTML = users
            .map((user, index) => `
                <article class="user-card">
                    <div class="user-card-head">
                        <div class="user-name">${user.name}</div>
                        <div class="user-badge">Record ${index + 1}</div>
                    </div>
                    <div class="user-meta">
                        <span class="meta-pill">Age: ${user.age}</span>
                        <span class="meta-pill">Gender: ${user.gender}</span>
                    </div>
                </article>
            `)
            .join('');
    }

    async function loadUsers() {
        listState.textContent = 'Loading users...';
        refreshBtn.disabled = true;

        try {
            const response = await fetch(apiBaseUrl);
            const users = await response.json();

            if (!response.ok) {
                throw new Error(users.error || 'Unable to load users.');
            }

            renderUsers(users);
        } catch (error) {
            listState.textContent = 'Could not load users from the server.';
            userList.innerHTML = '<div class="empty-state">Start the backend server to see saved data here.</div>';
        } finally {
            refreshBtn.disabled = false;
        }
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const payload = {
            name: document.getElementById('name').value.trim(),
            age: document.getElementById('age').value,
            gender: document.getElementById('gender').value
        };

        setSubmitting(true);
        feedback.classList.add('hidden');

        try {
            const response = await fetch(apiBaseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Unable to add user.');
            }

            form.reset();
            showFeedback('success', `${result.user.name} was added successfully.`);
            await loadUsers();
        } catch (error) {
            showFeedback('error', error.message || 'Cannot connect to the backend server.');
        } finally {
            setSubmitting(false);
        }
    });

    refreshBtn.addEventListener('click', loadUsers);

    loadUsers();
});
