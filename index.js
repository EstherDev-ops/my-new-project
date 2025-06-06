const challenges = {
    beginner: [
        {
            id: 1,
            title: "Personal Portfolio Website",
            language: "HTML/CSS/JavaScript",
            description: "Create a responsive personal portfolio with about, projects, and contact sections",
            timeline: 7,
            maxExtensions: 2,
            extensionDays: 3,
            skills: ["HTML", "CSS", "Responsive Design", "JavaScript"],
            difficulty: "Beginner"
        },
   
    ],
    advanced: [
        {
            id: 9,
            title: "E-commerce Platform",
            language: "React/Node.js",
            description: "Full-stack e-commerce with user auth, product catalog, and payment integration",
            timeline: 21,
            maxExtensions: 3,
            extensionDays: 7,
            skills: ["React", "Node.js", "Database", "Authentication", "Payment APIs"],
            difficulty: "Advanced"
        },
       
    ]
};


const deploymentOptions = [
    { id: 1, name: "Vercel", icon: "🚀" },
    { id: 2, name: "Netlify", icon: "🌐" },
  
];


let currentChallenge = null;
let selectedLevel = '';
let timeRemaining = 0;
let originalTimeRemaining = 0;
let challengeStatus = 'inactive';
let completedChallenges = [];
let extensionsUsed = 0;
let timerInterval = null;
let selectedDeployment = null;
let projectRepo = '';
let projectDemo = '';


function toggleDarkMode() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    
    if (body.getAttribute('data-theme') === 'light') {
        body.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Light Mode';
    } else {
        body.setAttribute('data-theme', 'light');
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Dark Mode';
    }
}


function formatTime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = seconds % 60;
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    return `${minutes}m ${secs}s`;
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        if (challengeStatus === 'active' && timeRemaining > 0) {
            timeRemaining--;
            originalTimeRemaining = Math.max(0, originalTimeRemaining - 1);
            
            document.getElementById('timer-display').textContent = formatTime(timeRemaining);
            
            if (timeRemaining <= 0) {
                challengeStatus = 'failed';
                showFailedChallenge();
                clearInterval(timerInterval);
            }
            
            updateCompleteButton();
        }
    }, 1000);
}


function selectChallenge(level) {
    const availableChallenges = challenges[level];
    const randomChallenge = availableChallenges[Math.floor(Math.random() * availableChallenges.length)];
    const initialTime = randomChallenge.timeline * 24 * 60 * 60;
    
    currentChallenge = randomChallenge;
    selectedLevel = level;
    timeRemaining = initialTime;
    originalTimeRemaining = initialTime;
    challengeStatus = 'active';
    extensionsUsed = 0;
    selectedDeployment = null;
    
    updateStats();
    showActiveChallenge();
    startTimer();
}

function showActiveChallenge() {
    document.getElementById('challenge-selection').classList.add('hidden');
    document.getElementById('failed-challenge').classList.add('hidden');
    document.getElementById('submission-form').classList.add('hidden');
    document.getElementById('active-challenge').classList.remove('hidden');
    
    document.getElementById('challenge-title').textContent = currentChallenge.title;
    document.getElementById('challenge-language').textContent = currentChallenge.language;
    document.getElementById('challenge-difficulty').textContent = currentChallenge.difficulty;
    document.getElementById('challenge-description').textContent = currentChallenge.description;
    document.getElementById('timer-display').textContent = formatTime(timeRemaining);
    
    // Update skills
    const skillsList = document.getElementById('skills-list');
    skillsList.innerHTML = '';
    currentChallenge.skills.forEach(skill => {
        const skillTag = document.createElement('span');
        skillTag.className = 'skill-tag';
        skillTag.textContent = skill;
        skillsList.appendChild(skillTag);
    });
    
    updateCompleteButton();
    updateExtensionButton();
    updateInfoMessages();
}

function updateCompleteButton() {
    const completeBtn = document.getElementById('complete-btn');
    const isTimeCompleted = originalTimeRemaining <= 0;
    
    completeBtn.disabled = !isTimeCompleted;
    completeBtn.textContent = isTimeCompleted ? '✅ Submit Project' : '✅ Complete After Timeline';
}

function updateExtensionButton() {
    const extensionBtn = document.getElementById('extension-btn');
    const extensionsLeft = currentChallenge.maxExtensions - extensionsUsed;
    
    if (extensionsLeft > 0) {
        extensionBtn.textContent = `📅 Request Extension (${extensionsLeft} left)`;
        extensionBtn.disabled = false;
    } else {
        extensionBtn.textContent = '📅 No Extensions Left';
        extensionBtn.disabled = true;
    }
}

function updateInfoMessages() {
    const infoMessages = document.getElementById('info-messages');
    infoMessages.innerHTML = '';
    
    if (originalTimeRemaining > 0) {
        const tipBox = document.createElement('div');
        tipBox.className = 'info-box tip';
        tipBox.innerHTML = `
            <strong>Tip:</strong> You need to complete the initial timeline before submitting. 
            ${extensionsUsed > 0 ? `You've used ${extensionsUsed} extension(s) already.` : ''}
        `;
        infoMessages.appendChild(tipBox);
    }
}

function requestExtension() {
    if (extensionsUsed >= currentChallenge.maxExtensions) return;
    
    const extensionDays = currentChallenge.extensionDays;
    const extensionSeconds = extensionDays * 24 * 60 * 60;
    
    timeRemaining += extensionSeconds;
    extensionsUsed++;
    
    const warningBox = document.createElement('div');
    warningBox.className = 'info-box warning';
    warningBox.innerHTML = `
        <strong>Extension Granted:</strong> You've been granted ${extensionDays} additional days.
        You have ${currentChallenge.maxExtensions - extensionsUsed} extensions remaining.
    `;
    document.getElementById('info-messages').appendChild(warningBox);
    
    updateExtensionButton();
    startTimer();
}

function showSubmissionForm() {
    document.getElementById('active-challenge').classList.add('hidden');
    document.getElementById('submission-form').classList.remove('hidden');
    

    const deploymentGrid = document.getElementById('deployment-options');
    deploymentGrid.innerHTML = '';
    
    deploymentOptions.forEach(option => {
        const optionEl = document.createElement('div');
        optionEl.className = 'deployment-option';
        if (selectedDeployment === option.id) {
            optionEl.classList.add('selected');
        }
        optionEl.innerHTML = `
            <div class="deployment-icon">${option.icon}</div>
            <div class="deployment-name">${option.name}</div>
        `;
        optionEl.onclick = () => selectDeployment(option.id);
        deploymentGrid.appendChild(optionEl);
    });
    

    document.getElementById('project-repo').value = '';
    document.getElementById('project-demo').value = '';
}

function hideSubmissionForm() {
    document.getElementById('submission-form').classList.add('hidden');
    document.getElementById('active-challenge').classList.remove('hidden');
}

function selectDeployment(id) {
    selectedDeployment = id;
    const options = document.querySelectorAll('.deployment-option');
    options.forEach(option => {
        option.classList.remove('selected');
        if (parseInt(option.getAttribute('data-id')) === id) {
            option.classList.add('selected');
        }
    });
}

function completeChallenge() {
    projectRepo = document.getElementById('project-repo').value.trim();
    projectDemo = document.getElementById('project-demo').value.trim();
    
    if (!projectRepo) {
        alert('Please provide a project repository URL');
        return;
    }
    

    const deploymentPlatform = deploymentOptions.find(
        opt => opt.id === selectedDeployment
    )?.name || 'Not specified';
    

    challengeStatus = 'completed';
    completedChallenges.push({
        ...currentChallenge,
        completionDate: new Date().toLocaleDateString(),
        deployment: deploymentPlatform,
        repoUrl: projectRepo,
        demoUrl: projectDemo
    });
    

    updateStats();
    

    showCertificate(deploymentPlatform);
}

function showCertificate(deploymentPlatform) {
    const modal = document.getElementById('certificate-modal');
    modal.classList.remove('hidden');
    
    document.getElementById('cert-title').textContent = currentChallenge.title;
    document.getElementById('cert-language').textContent = currentChallenge.language;
    document.getElementById('cert-deployment-platform').textContent = deploymentPlatform;
    document.getElementById('cert-date').textContent = `Completed on: ${new Date().toLocaleDateString()}`;
}

function closeCertificate() {
    document.getElementById('certificate-modal').classList.add('hidden');
    resetChallenge();
}

function showFailedChallenge() {
    document.getElementById('active-challenge').classList.add('hidden');
    document.getElementById('failed-challenge').classList.remove('hidden');
    
    document.getElementById('failed-challenge-info').textContent = `
        ${currentChallenge.title} (${currentChallenge.language}) - ${currentChallenge.difficulty} level
    `;
}

function resetChallenge() {
    clearInterval(timerInterval);
    timerInterval = null;
    currentChallenge = null;
    challengeStatus = 'inactive';
    
    document.getElementById('active-challenge').classList.add('hidden');
    document.getElementById('failed-challenge').classList.add('hidden');
    document.getElementById('submission-form').classList.add('hidden');
    document.getElementById('challenge-selection').classList.remove('hidden');
    
    updateStats();
}

function updateStats() {
    document.getElementById('completed-count').textContent = completedChallenges.length;
    document.getElementById('current-level').textContent = selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1);
    document.getElementById('current-status').textContent = 
        challengeStatus === 'active' ? 'Active' : 
        challengeStatus === 'completed' ? 'Completed' : 'Inactive';
}


function initDeploymentOptions() {
    const deploymentGrid = document.getElementById('deployment-options');
    deploymentOptions.forEach(option => {
        const optionEl = document.createElement('div');
        optionEl.className = 'deployment-option';
        optionEl.setAttribute('data-id', option.id);
        optionEl.innerHTML = `
            <div class="deployment-icon">${option.icon}</div>
            <div class="deployment-name">${option.name}</div>
        `;
        optionEl.onclick = () => selectDeployment(option.id);
        deploymentGrid.appendChild(optionEl);
    });
}


document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    initDeploymentOptions();
});
   
   