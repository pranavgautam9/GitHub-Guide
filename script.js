// Git topics and scenarios data
const gitData = {
    "Commit": [
        "Change commit message",
        "Amend last commit",
        "Create a commit",
        "Undo last commit",
        "Squash multiple commits",
        "View commit history",
        "Commit specific files only"
    ],
    "Branch": [
        "Create a new branch",
        "Delete a branch",
        "Switch between branches",
        "Rename a branch",
        "Merge branches",
        "View all branches",
        "Compare branches"
    ],
    "Merge Conflict": [
        "Resolve merge conflicts",
        "Prevent merge conflicts",
        "Abort a merge",
        "Understand conflict markers",
        "Merge strategies"
    ],
    "Staging": [
        "Stage your changes",
        "Unstage files",
        "Stage specific files",
        "View staged changes",
        "Stage all changes"
    ],
    "Remote": [
        "Add remote repository",
        "Remove remote",
        "Push to remote",
        "Pull from remote",
        "Clone a repository",
        "View remote URLs",
        "Change remote URL"
    ],
    "Reset & Revert": [
        "Reset to previous commit",
        "Revert a commit",
        "Hard reset",
        "Soft reset",
        "Mixed reset",
        "Undo changes"
    ],
    "Stash": [
        "Save changes to stash",
        "Apply stashed changes",
        "View stash list",
        "Delete stash",
        "Pop from stash"
    ],
    "Tag": [
        "Create a tag",
        "Delete a tag",
        "Push tags to remote",
        "List all tags",
        "Checkout a tag"
    ],
    "Log & History": [
        "View commit log",
        "Search commit history",
        "View file history",
        "Compare commits",
        "Find when bug was introduced"
    ],
    "Don't know what you're looking for?": []
};

// DOM elements
const topicDropdown = document.getElementById('topic-dropdown');
const topicSelected = document.getElementById('topic-selected');
const topicSearch = document.getElementById('topic-search');
const topicOptions = document.getElementById('topic-options');
const scenarioDropdown = document.getElementById('scenario-dropdown');
const scenarioSelected = document.getElementById('scenario-selected');
const scenarioSearch = document.getElementById('scenario-search');
const scenarioOptions = document.getElementById('scenario-options');
const scenarioWrapper = document.getElementById('scenario-wrapper');
const textInputWrapper = document.getElementById('text-input-wrapper');
const customQuestion = document.getElementById('custom-question');
const submitCustomBtn = document.getElementById('submit-custom');
const responsePanel = document.getElementById('response-panel');
const responseContent = document.getElementById('response-content');
const closeResponseBtn = document.getElementById('close-response');
const loading = document.getElementById('loading');

let selectedTopic = null;
let selectedScenario = null;

// Initialize topic dropdown
function initTopicDropdown() {
    Object.keys(gitData).forEach(topic => {
        const option = document.createElement('div');
        option.className = 'dropdown-option';
        option.textContent = topic;
        option.dataset.topic = topic;
        option.addEventListener('click', () => selectTopic(topic));
        topicOptions.appendChild(option);
    });
}

// Initialize scenario dropdown
function initScenarioDropdown() {
    scenarioOptions.innerHTML = '';
    if (selectedTopic && gitData[selectedTopic]) {
        gitData[selectedTopic].forEach(scenario => {
            const option = document.createElement('div');
            option.className = 'dropdown-option';
            option.textContent = scenario;
            option.dataset.scenario = scenario;
            option.addEventListener('click', () => selectScenario(scenario));
            scenarioOptions.appendChild(option);
        });
    }
}

// Select topic
function selectTopic(topic) {
    selectedTopic = topic;
    topicSelected.querySelector('span:not(.dropdown-arrow)').textContent = topic;
    topicSelected.querySelector('span:not(.dropdown-arrow)').classList.remove('placeholder');
    topicDropdown.classList.remove('active');
    topicSearch.value = '';
    filterOptions(topicSearch, topicOptions);
    
    // Hide response panel
    responsePanel.style.display = 'none';
    
    // Check if it's the "Don't know" option
    if (topic === "Don't know what you're looking for?") {
        scenarioWrapper.style.display = 'none';
        textInputWrapper.style.display = 'block';
        selectedScenario = null;
    } else {
        scenarioWrapper.style.display = 'block';
        textInputWrapper.style.display = 'none';
        initScenarioDropdown();
        scenarioSelected.querySelector('span:not(.dropdown-arrow)').textContent = 'Choose a scenario...';
        scenarioSelected.querySelector('span:not(.dropdown-arrow)').classList.add('placeholder');
        scenarioSearch.value = '';
        selectedScenario = null;
    }
}

// Select scenario
function selectScenario(scenario) {
    selectedScenario = scenario;
    scenarioSelected.querySelector('span:not(.dropdown-arrow)').textContent = scenario;
    scenarioSelected.querySelector('span:not(.dropdown-arrow)').classList.remove('placeholder');
    scenarioDropdown.classList.remove('active');
    scenarioSearch.value = '';
    filterOptions(scenarioSearch, scenarioOptions);
    
    // Get answer from GPT
    getGitAnswer(selectedTopic, selectedScenario);
}

// Filter dropdown options based on search
function filterOptions(searchInput, optionsContainer) {
    const searchTerm = searchInput.value.toLowerCase();
    const options = optionsContainer.querySelectorAll('.dropdown-option');
    
    options.forEach(option => {
        const text = option.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            option.classList.remove('hidden');
        } else {
            option.classList.add('hidden');
        }
    });
}

// Toggle dropdown
function toggleDropdown(dropdown, searchInput, optionsContainer) {
    const isActive = dropdown.classList.contains('active');
    
    // Close all dropdowns
    document.querySelectorAll('.custom-dropdown').forEach(d => {
        d.classList.remove('active');
    });
    
    // Toggle current dropdown
    if (!isActive) {
        dropdown.classList.add('active');
        searchInput.focus();
    }
}

// Event listeners for topic dropdown
topicSelected.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown(topicDropdown, topicSearch, topicOptions);
});

topicSearch.addEventListener('input', () => {
    filterOptions(topicSearch, topicOptions);
});

topicSearch.addEventListener('click', (e) => {
    e.stopPropagation();
});

// Event listeners for scenario dropdown
scenarioSelected.addEventListener('click', (e) => {
    e.stopPropagation();
    if (selectedTopic && selectedTopic !== "Don't know what you're looking for?") {
        toggleDropdown(scenarioDropdown, scenarioSearch, scenarioOptions);
    }
});

scenarioSearch.addEventListener('input', () => {
    filterOptions(scenarioSearch, scenarioOptions);
});

scenarioSearch.addEventListener('click', (e) => {
    e.stopPropagation();
});

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!topicDropdown.contains(e.target)) {
        topicDropdown.classList.remove('active');
    }
    if (!scenarioDropdown.contains(e.target)) {
        scenarioDropdown.classList.remove('active');
    }
});

// Submit custom question
submitCustomBtn.addEventListener('click', () => {
    const question = customQuestion.value.trim();
    if (question) {
        getCustomGitAnswer(question);
    } else {
        alert('Please enter your question first.');
    }
});

// Allow Enter key to submit custom question
customQuestion.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        submitCustomBtn.click();
    }
});

// Close response panel
closeResponseBtn.addEventListener('click', () => {
    responsePanel.style.display = 'none';
});

// Check if question is Git-related
async function isGitRelated(question) {
    const gitKeywords = [
        'git', 'commit', 'branch', 'merge', 'push', 'pull', 'clone', 'stash',
        'revert', 'reset', 'rebase', 'remote', 'tag', 'diff', 'log', 'status',
        'add', 'stage', 'repository', 'repo', 'conflict', 'fork', 'pull request',
        'pr', 'head', 'master', 'main', 'origin', 'upstream', 'checkout',
        'cherry-pick', 'amend', 'squash', 'reflog', 'blame', 'bisect'
    ];
    
    const questionLower = question.toLowerCase();
    return gitKeywords.some(keyword => questionLower.includes(keyword));
}

// Get answer from OpenAI API
async function getGitAnswer(topic, scenario) {
    loading.style.display = 'block';
    responsePanel.style.display = 'none';
    
    const prompt = `You are a Git expert. Provide a clear, concise, and helpful answer to this Git question:

Topic: ${topic}
Scenario: ${scenario}

Please provide:
1. A brief explanation of what this involves
2. Step-by-step instructions or commands
3. Any important notes or warnings
4. Examples if helpful

Format your response in clear, readable text. Use code blocks for Git commands.`;

    try {
        const response = await callOpenAI(prompt);
        displayResponse(response);
    } catch (error) {
        displayError('Failed to get answer: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}

// Get answer for custom question
async function getCustomGitAnswer(question) {
    // Check if question is Git-related
    const isGit = await isGitRelated(question);
    
    if (!isGit) {
        displayError('Please ask a Git-related question. This assistant only helps with Git version control topics. Examples: commits, branches, merges, conflicts, etc.');
        return;
    }
    
    loading.style.display = 'block';
    responsePanel.style.display = 'none';
    
    const prompt = `You are a Git expert. A user has the following Git-related question or situation:

"${question}"

Please provide:
1. A clear understanding of their situation
2. Step-by-step solution or explanation
3. Relevant Git commands (in code blocks)
4. Any important warnings or best practices
5. Examples if helpful

Format your response in clear, readable text. Be helpful and thorough.`;

    try {
        const response = await callOpenAI(prompt);
        displayResponse(response);
    } catch (error) {
        displayError('Failed to get answer: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}

// Call backend API (which proxies to OpenAI/Groq)
async function callOpenAI(prompt) {
    // Use API_BASE_URL from config.js if available, otherwise fallback to relative path
    const baseUrl = (typeof API_BASE_URL !== 'undefined' && API_BASE_URL)
        ? API_BASE_URL
        : '';
    const apiUrl = `${baseUrl}/api/chat`;

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response from server');
    }
    
    const data = await response.json();
    return data.content;
}

// Display response
function displayResponse(text) {
    // Check if marked library is available
    if (typeof marked !== 'undefined') {
        // Use marked.js to parse markdown
        marked.setOptions({
            breaks: true,
            gfm: true
        });
        
        // Parse markdown to HTML
        const html = marked.parse(text);
        responseContent.innerHTML = html;
    } else {
        // Fallback to basic formatting if marked.js isn't loaded
        let formattedText = text
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        
        responseContent.innerHTML = `<p>${formattedText}</p>`;
    }
    
    responsePanel.style.display = 'block';
    responsePanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Display error
function displayError(message) {
    responseContent.innerHTML = `<div class="error-message">${message}</div>`;
    responsePanel.style.display = 'block';
    responsePanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Initialize on load
window.addEventListener('load', () => {
    initTopicDropdown();
});

