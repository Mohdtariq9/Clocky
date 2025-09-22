const currentTimeEl = document.getElementById('current-time');
const alarmInput = document.getElementById('alarm-time');
const alarmSoundSelect = document.getElementById('alarm-sound');
const customSoundInput = document.getElementById('custom-sound');
const setAlarmBtn = document.getElementById('set-alarm-btn');
const alarmsList = document.getElementById('alarms-list');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const clearAlarmsBtn = document.getElementById('clear-alarms-btn');


let alarms = [];

// Load alarms from localStorage
function loadAlarms() {
    const storedAlarms = localStorage.getItem('alarms');
    if (storedAlarms) alarms = JSON.parse(storedAlarms);
}

// Save alarms to localStorage
function saveAlarms() {
    localStorage.setItem('alarms', JSON.stringify(alarms));
}

// Update current time every second
function updateTime() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');
    currentTimeEl.textContent = `${h}:${m}:${s}`;

    // Check alarms
    alarms.forEach((alarm, index) => {
        if (!alarm.triggered && `${h}:${m}` === alarm.time) {
            alarm.triggered = true;
            saveAlarms();
            playAlarm(alarm, index);
        }
    });
}

// Play alarm with Stop/Snooze
function playAlarm(alarm, index) {
    const audio = new Audio(alarm.sound);
    audio.loop = true;
    audio.play();

    // Update alarm list UI
    renderAlarms(audio, index);
}

// Render alarms
function renderAlarms(activeAudio = null, activeIndex = -1) {
    alarmsList.innerHTML = '';
    alarms.forEach((alarm, index) => {
        const li = document.createElement('li');
        li.textContent = alarm.time;

        if (alarm.triggered && index === activeIndex && activeAudio) {
            const stopBtn = document.createElement('button');
            stopBtn.textContent = 'Stop';
            stopBtn.className = 'stop';
            stopBtn.onclick = () => {
                activeAudio.pause();
                activeAudio.currentTime = 0;
                alarms.splice(index, 1);
                saveAlarms();
                renderAlarms();
            };

            const snoozeBtn = document.createElement('button');
            snoozeBtn.textContent = 'Snooze 5 min';
            snoozeBtn.className = 'snooze';
            snoozeBtn.onclick = () => {
                activeAudio.pause();
                activeAudio.currentTime = 0;
                const now = new Date();
                now.setMinutes(now.getMinutes() + 5);
                const newTime = now.toTimeString().slice(0, 5);
                alarms.push({ time: newTime, sound: alarm.sound, triggered: false });
                alarms.splice(index, 1);
                saveAlarms();
                renderAlarms();
            };

            li.appendChild(stopBtn);
            li.appendChild(snoozeBtn);
        } else {
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.onclick = () => {
                alarms.splice(index, 1);
                saveAlarms();
                renderAlarms();
            };
            li.appendChild(removeBtn);
        }

        alarmsList.appendChild(li);
    });
    // Show or hide Clear All button
    if (alarms.length === 0) {
        clearAlarmsBtn.style.display = 'none';
    } else {
        clearAlarmsBtn.style.display = 'block';
    }

}

// Set alarm
setAlarmBtn.addEventListener('click', () => {
    if (!alarmInput.value) return alert("Select a time!");

    let sound = alarmSoundSelect.value;
    if (customSoundInput.files.length > 0) {
        sound = URL.createObjectURL(customSoundInput.files[0]);
    }

    alarms.push({ time: alarmInput.value, sound, triggered: false });
    saveAlarms();
    alarmInput.value = '';
    customSoundInput.value = '';
    renderAlarms();
});

// Dark mode toggle
darkModeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark', darkModeToggle.checked);
});

// Initialize
loadAlarms();
renderAlarms();
setInterval(updateTime, 1000);

clearAlarmsBtn.addEventListener('click', () => {
    if (alarms.length === 0) return;
    if (confirm("Are you sure you want to clear all alarms?")) {
        alarms = [];
        saveAlarms();
        renderAlarms();
    }
});
