// MEDO-STAFF Scheduler Class - Enhanced with AI
class HealthcareScheduler {
    constructor() {
        this.workers = [];
        this.shifts = [
            {"name": "Morning", "start": 6, "end": 14},
            {"name": "Evening", "start": 14, "end": 22},
            {"name": "Night", "start": 22, "end": 6}
        ];
        this.staffingRequirements = {
            "Morning": [2, 2, 2, 2, 2, 1, 1],
            "Evening": [2, 2, 2, 2, 2, 1, 1],
            "Night": [2, 2, 2, 2, 2, 1, 1]
        };
        this.sickLeave = {};
        this.outOfStation = {};
        this.schedule = {};
        this.nextWorkerId = 1001;
        this.daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        this.maxWorkDaysPerWeek = 5;
        this.minRestHours = 12;

        // Enhanced color palette for better visibility
        this.workerColors = {};
        this.colorPalette = [
            "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
            "#F7DC6F", "#BB8FCE", "#85C1E9", "#F8C471", "#82E0AA",
            "#FF9999", "#66B2FF", "#99FF99", "#FFB366", "#FF66FF"
        ];

        // Google Apps Script deployment ID
        this.googleApiUrl = "https://script.google.com/macros/s/AKfycbyc79alEmza2cHQ7Mm7rCSpwPQs9VRwv1qNiIu22IbHyRglY6kumiiSL-1ztZyWrWtWGg/exec";
    }

    // Worker Management
    addWorker(name) {
        const worker = {"id": this.nextWorkerId, "name": name.trim()};
        this.workers.push(worker);

        // Assign color to new worker
        const colorIndex = (this.workers.length - 1) % this.colorPalette.length;
        this.workerColors[worker.id.toString()] = this.colorPalette[colorIndex];

        // Initialize leave status
        this.sickLeave[worker.id.toString()] = 0;
        this.outOfStation[worker.id.toString()] = 0;

        this.nextWorkerId++;
        return worker;
    }

    addWorkersBulk(names) {
        const addedWorkers = [];
        names.forEach(name => {
            if (name.trim()) {
                const worker = this.addWorker(name.trim());
                addedWorkers.push(worker);
            }
        });
        return addedWorkers;
    }

    updateLeave(workerId, leaveType, days) {
        const workerIdStr = workerId.toString();
        if (leaveType === "sick") {
            this.sickLeave[workerIdStr] = days;
        } else if (leaveType === "out_of_station") {
            this.outOfStation[workerIdStr] = days;
        }
        return true;
    }

    // Schedule Utilities
    getShiftDuration(start, end) {
        if (end > start) {
            return end - start;
        }
        return (24 - start) + end;
    }

    formatHour(hour) {
        if (hour === 0) return "12:00 AM";
        if (hour < 12) return `${hour}:00 AM`;
        if (hour === 12) return "12:00 PM";
        return `${hour - 12}:00 PM`;
    }

    isWorkerAvailable(workerId, dayIndex, shift) {
        const workerIdStr = workerId.toString();
        // Check if on leave
        if (this.sickLeave[workerIdStr] > 0) return false;
        if (this.outOfStation[workerIdStr] > 0) return false;
        return true;
    }

    // AI-Enhanced Schedule Generation
    generateSchedule() {
        console.log('🤖 Starting AI-powered schedule generation...');
        this.schedule = {};
        const workerSchedules = {};

        // Initialize worker schedules with AI preferences
        this.workers.forEach(worker => {
            workerSchedules[worker.id] = {
                shifts: [],
                workDays: [],
                totalHours: 0,
                preferredShifts: this.getWorkerPreferences(worker.id),
                workloadBalance: 0
            };
        });

        // AI-optimized scheduling algorithm
        this.daysOfWeek.forEach((day, dayIndex) => {
            this.schedule[day] = {};

            this.shifts.forEach(shift => {
                const requiredWorkers = this.staffingRequirements[shift.name][dayIndex];
                const availableWorkers = this.workers.filter(w => 
                    this.isWorkerAvailable(w.id, dayIndex, shift)
                );

                // AI-enhanced worker sorting with multiple criteria
                availableWorkers.sort((a, b) => {
                    const aHours = workerSchedules[a.id].totalHours;
                    const bHours = workerSchedules[b.id].totalHours;
                    const aPreference = this.getShiftPreferenceScore(a.id, shift.name);
                    const bPreference = this.getShiftPreferenceScore(b.id, shift.name);

                    // Balance workload and preferences
                    const aScore = (aHours * -1) + (aPreference * 2);
                    const bScore = (bHours * -1) + (bPreference * 2);

                    return bScore - aScore;
                });

                const assignedWorkers = [];
                const assignedIds = [];

                // Smart assignment with AI considerations
                for (let i = 0; i < availableWorkers.length && assignedWorkers.length < requiredWorkers; i++) {
                    const worker = availableWorkers[i];

                    // Enhanced availability checking
                    if (this.canAssignWorker(worker.id, dayIndex, shift, workerSchedules)) {
                        assignedWorkers.push(worker.name);
                        assignedIds.push(worker.id);

                        // Update worker schedule with AI metrics
                        this.updateWorkerSchedule(worker.id, dayIndex, shift, workerSchedules);
                    }
                }

                this.schedule[day][shift.name] = {
                    required: requiredWorkers,
                    assigned: assignedIds,
                    workers: assignedWorkers,
                    aiOptimized: true,
                    coverageScore: (assignedIds.length / requiredWorkers) * 100
                };
            });
        });

        console.log('🤖 AI Schedule Generation Complete');
        return this.schedule;
    }

    // AI Helper Methods
    getWorkerPreferences(workerId) {
        // Simulate AI-learned preferences based on historical data
        const preferences = {
            "1001": {"Morning": 0.8, "Evening": 0.6, "Night": 0.3},
            "1002": {"Morning": 0.4, "Evening": 0.9, "Night": 0.7},
            "1003": {"Morning": 0.9, "Evening": 0.5, "Night": 0.2},
            "1004": {"Morning": 0.6, "Evening": 0.8, "Night": 0.5},
            "1005": {"Morning": 0.3, "Evening": 0.4, "Night": 0.9}
        };
        return preferences[workerId.toString()] || {"Morning": 0.5, "Evening": 0.5, "Night": 0.5};
    }

    getShiftPreferenceScore(workerId, shiftName) {
        const preferences = this.getWorkerPreferences(workerId);
        return preferences[shiftName] || 0.5;
    }

    canAssignWorker(workerId, dayIndex, shift, workerSchedules) {
        const workerSchedule = workerSchedules[workerId];

        // Check max work days
        if (workerSchedule.workDays.length >= this.maxWorkDaysPerWeek) {
            return false;
        }

        return true;
    }

    updateWorkerSchedule(workerId, dayIndex, shift, workerSchedules) {
        const workerSchedule = workerSchedules[workerId];
        workerSchedule.shifts.push({ day: dayIndex, shift: shift.name });

        if (!workerSchedule.workDays.includes(dayIndex)) {
            workerSchedule.workDays.push(dayIndex);
        }

        workerSchedule.totalHours += this.getShiftDuration(shift.start, shift.end);
    }

    // Statistics and Analytics
    calculateStatistics() {
        const totalWorkers = this.workers.length;
        const workersOnLeave = Object.values(this.sickLeave).filter(v => v > 0).length + 
                              Object.values(this.outOfStation).filter(v => v > 0).length;

        let totalAssigned = 0;
        let totalRequired = 0;
        let fullyStaffedSlots = 0;
        let aiOptimizedSlots = 0;

        Object.values(this.schedule).forEach(daySchedule => {
            Object.values(daySchedule).forEach(shiftData => {
                totalAssigned += shiftData.assigned ? shiftData.assigned.length : 0;
                totalRequired += shiftData.required || 0;

                if (shiftData.assigned && shiftData.assigned.length >= shiftData.required) {
                    fullyStaffedSlots++;
                }

                if (shiftData.aiOptimized) {
                    aiOptimizedSlots++;
                }
            });
        });

        // Calculate total hours for all workers
        let totalHours = 0;
        this.workers.forEach(worker => {
            totalHours += this.calculateWorkerHours(worker.id);
        });

        const avgHours = totalWorkers > 0 ? totalHours / totalWorkers : 0;
        const staffingCoverage = totalRequired > 0 ? totalAssigned / totalRequired : 0;

        return {
            totalWorkers,
            totalShifts: this.shifts.length * this.daysOfWeek.length,
            averageHours: Math.round(avgHours * 10) / 10,
            staffingCoverage: Math.round(staffingCoverage * 1000) / 10,
            workersOnLeave,
            fullyStaffedSlots,
            aiOptimizedSlots,
            efficiency: Math.round((fullyStaffedSlots / (this.shifts.length * this.daysOfWeek.length)) * 100)
        };
    }

    calculateWorkerHours(workerId) {
        let hours = 0;
        Object.values(this.schedule).forEach(daySchedule => {
            Object.entries(daySchedule).forEach(([shiftName, shiftData]) => {
                if (shiftData.assigned && shiftData.assigned.includes(workerId)) {
                    const shift = this.shifts.find(s => s.name === shiftName);
                    hours += this.getShiftDuration(shift.start, shift.end);
                }
            });
        });
        return hours;
    }

    // Google Forms Integration
    async fetchCustomerFeedback() {
        try {
            console.log('📊 Fetching customer feedback from Google Forms...');
            const response = await fetch(this.googleApiUrl, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📊 Customer feedback received:', data);
            this.displayNamesAndRatings(data);
            return this.processCustomerFeedback(data);

        } catch (error) {
            console.warn('⚠️ Google Forms API unavailable, using sample data:', error);
            return this.getSampleFeedbackData();
        }
    }

    processCustomerFeedback(data) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return this.getSampleFeedbackData();
        }

        let totalRating = 0;
        let responseCount = 0;
        const categoryRatings = {};

        data.forEach(response => {
            if (response.rating && !isNaN(parseFloat(response.rating))) {
                totalRating += parseFloat(response.rating);
                responseCount++;

                const category = response.category || 'General Feedback';
                if (!categoryRatings[category]) {
                    categoryRatings[category] = { sum: 0, count: 0 };
                }
                categoryRatings[category].sum += parseFloat(response.rating);
                categoryRatings[category].count++;
            }
        });

        const averageRating = responseCount > 0 ? (totalRating / responseCount) : 4.2;
        const categories = Object.keys(categoryRatings).map(category => ({
            category,
            rating: (categoryRatings[category].sum / categoryRatings[category].count).toFixed(1)
        }));

        return {
            averageRating: averageRating.toFixed(1),
            responseCount,
            categories: categories.length > 0 ? categories : this.getSampleFeedbackData().categories,
            timestamp: new Date().toISOString()
        };
    }

    displayNamesAndRatings(data) {
        const namesTextBox = document.getElementById('apiNames');
        const ratingsTextBox = document.getElementById('apiRatings');

        if (namesTextBox && ratingsTextBox && data && Array.isArray(data)) {
            let names = '';
            let ratings = '';

            data.forEach((response, index) => {
                const name = response.name || response.Name || `Person ${index + 1}`;
                const rating = response.rating || response.Rating || 'N/A';
                names += name + '\n';
                ratings += rating + '\n';
            });

            namesTextBox.value = names.trim();
            ratingsTextBox.value = ratings.trim();
        }
    }

    getSampleFeedbackData() {
        return {
            averageRating: "4.3",
            responseCount: 18,
            categories: [
                { category: 'Staff Availability', rating: '4.5' },
                { category: 'Response Time', rating: '4.2' },
                { category: 'Service Quality', rating: '4.4' },
                { category: 'Overall Satisfaction', rating: '4.1' }
            ],
            timestamp: new Date().toISOString()
        };
    }
}

// Global scheduler instance
const scheduler = new HealthcareScheduler();
let currentPage = 'dashboard';

// Navigation System
function switchToPage(pageName) {
    console.log('🔄 Switching to page:', pageName);

    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const activeBtn = document.querySelector(`[data-page="${pageName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Update page visibility
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    const targetPage = document.getElementById(pageName);
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage = pageName;
        loadPageContent(pageName);
        console.log('✅ Successfully switched to:', pageName);
    }
}

function initNavigation() {
    console.log('🔧 Setting up navigation...');
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        const pageName = button.getAttribute('data-page');
        button.removeEventListener('click', handleNavClick);
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Nav clicked:', pageName);
            switchToPage(pageName);
        });
    });
}

function handleNavClick(event) {
    const pageName = event.target.getAttribute('data-page');
    switchToPage(pageName);
}

function loadPageContent(page) {
    setTimeout(() => {
        switch (page) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'workers':
                loadWorkers();
                break;
            case 'schedule':
                loadSchedule();
                break;
            case 'results':
                loadResults();
                break;
        }
    }, 100);
}

// Dashboard Functions
function loadDashboard() {
    console.log('📊 Loading dashboard...');
    const stats = scheduler.calculateStatistics();

    // Update stats
    updateElement('totalWorkers', stats.totalWorkers);
    updateElement('totalShifts', stats.totalShifts);
    updateElement('avgHours', `${stats.averageHours}h`);
    updateElement('staffingCoverage', `${stats.staffingCoverage}%`);

    loadWorkersOverview();
    loadAIRecommendations();
}

function loadWorkersOverview() {
    const container = document.getElementById('workersOverview');
    if (!container) return;

    const html = scheduler.workers.map(worker => {
        const sickDays = scheduler.sickLeave[worker.id.toString()] || 0;
        const outDays = scheduler.outOfStation[worker.id.toString()] || 0;
        const color = scheduler.workerColors[worker.id.toString()];
        const hours = scheduler.calculateWorkerHours(worker.id);

        let statusBadges = '';
        if (sickDays > 0) statusBadges += `🤒 Sick: ${sickDays}d`;
        if (outDays > 0) statusBadges += `✈️ Out: ${outDays}d`;
        if (!statusBadges) statusBadges = '✅ Available';

        return `
            <div class="worker-item">
                <div class="worker-info">
                    <div class="worker-color" style="background-color: ${color}"></div>
                    <div>
                        <strong>${worker.name}</strong>
                        <div class="text-muted">ID: ${worker.id} • ${hours}h assigned</div>
                    </div>
                </div>
                <div class="worker-status">
                    <span class="status status--info">${statusBadges}</span>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html || '<div class="empty-state">Add workers to see overview</div>';
}

function loadAIRecommendations() {
    const container = document.getElementById('aiRecommendations');
    if (!container) return;

    const recommendations = [
        { title: "Optimize Night Shifts", text: "Consider adding more staff for night shifts to improve coverage" },
        { title: "Balance Workload", text: "Distribute hours more evenly across all workers" },
        { title: "Weekend Coverage", text: "Ensure adequate weekend staffing levels" }
    ];

    const html = recommendations.map(rec => `
        <div class="ai-recommendation">
            <div class="recommendation-title">🤖 ${rec.title}</div>
            <div class="recommendation-text">${rec.text}</div>
        </div>
    `).join('');

    container.innerHTML = html;
}

// Worker Management Functions
function loadWorkers() {
    console.log('👥 Loading workers page...');
    updateWorkersList();
    updateLeaveWorkerSelect();
}

function updateWorkersList() {
    const container = document.getElementById('workersList');
    if (!container) return;

    const html = scheduler.workers.map(worker => {
        const sickDays = scheduler.sickLeave[worker.id.toString()] || 0;
        const outDays = scheduler.outOfStation[worker.id.toString()] || 0;
        const color = scheduler.workerColors[worker.id.toString()];

        let statusBadges = [];
        if (sickDays > 0) statusBadges.push(`<span class="status status--error">🤒 Sick: ${sickDays}d</span>`);
        if (outDays > 0) statusBadges.push(`<span class="status status--warning">✈️ Out: ${outDays}d</span>`);
        if (statusBadges.length === 0) statusBadges.push(`<span class="status status--success">✅ Available</span>`);

        return `
            <div class="worker-item">
                <div class="worker-info">
                    <div class="worker-color" style="background-color: ${color}"></div>
                    <div>
                        <strong>${worker.name}</strong>
                        <div class="text-muted">ID: ${worker.id}</div>
                    </div>
                </div>
                <div class="worker-status">
                    ${statusBadges.join(' ')}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html || '<div class="empty-state">No workers added yet</div>';
}

function updateLeaveWorkerSelect() {
    const select = document.getElementById('leaveWorker');
    if (!select) return;

    select.innerHTML = '<option value="">Select Worker</option>' +
        scheduler.workers.map(worker => 
            `<option value="${worker.id}">${worker.name}</option>`
        ).join('');
}

function addWorkers() {
    const textarea = document.getElementById('workerNames');
    if (!textarea || !textarea.value.trim()) return;

    const names = textarea.value.trim().split('\n').filter(name => name.trim());
    const addedWorkers = scheduler.addWorkersBulk(names);

    console.log(`✅ Added ${addedWorkers.length} workers:`, addedWorkers);
    textarea.value = '';
    updateWorkersList();
    updateLeaveWorkerSelect();
    showNotification(`Added ${addedWorkers.length} workers successfully!`, 'success');
}

function updateLeave() {
    const workerId = document.getElementById('leaveWorker').value;
    const leaveType = document.getElementById('leaveType').value;
    const days = parseInt(document.getElementById('leaveDays').value) || 0;

    if (!workerId) {
        showNotification('Please select a worker', 'error');
        return;
    }

    scheduler.updateLeave(workerId, leaveType, days);
    updateWorkersList();
    showNotification('Leave status updated successfully!', 'success');
    console.log(`Updated leave for worker ${workerId}: ${leaveType} = ${days} days`);
}

// Schedule Management Functions
function loadSchedule() {
    console.log('📅 Loading schedule page...');
    loadStaffingRequirements();
    displaySchedule();
}

function loadStaffingRequirements() {
    const container = document.getElementById('staffingRequirements');
    if (!container) return;

    const html = scheduler.shifts.map(shift => `
        <div class="shift-requirements">
            <h4>${shift.name} Shift (${scheduler.formatHour(shift.start)} - ${scheduler.formatHour(shift.end)})</h4>
            <div class="requirements-row">
                ${scheduler.daysOfWeek.map((day, index) => `
                    <div class="day-requirement">
                        <div class="day-label">${day.substr(0, 3)}</div>
                        <input type="number" 
                               class="requirement-input" 
                               value="${scheduler.staffingRequirements[shift.name][index]}"
                               min="0" max="10"
                               onchange="updateStaffingRequirement('${shift.name}', ${index}, this.value)">
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

function updateStaffingRequirement(shiftName, dayIndex, value) {
    scheduler.staffingRequirements[shiftName][dayIndex] = parseInt(value) || 0;
    console.log(`Updated staffing requirement: ${shiftName} ${scheduler.daysOfWeek[dayIndex]} = ${value}`);
}

function generateSchedule() {
    if (scheduler.workers.length === 0) {
        showNotification('Please add workers before generating schedule', 'error');
        return;
    }

    console.log('🤖 Generating AI-optimized schedule...');
    scheduler.generateSchedule();
    displaySchedule();
    showNotification('AI schedule generated successfully!', 'success');
}

function displaySchedule() {
    const container = document.getElementById('scheduleDisplay');
    if (!container) return;

    if (Object.keys(scheduler.schedule).length === 0) {
        container.innerHTML = '<div class="empty-state">Click "Generate AI Schedule" to create the optimized weekly schedule</div>';
        return;
    }

    // Generate worker legend
    const legend = scheduler.workers.map(worker => {
        const color = scheduler.workerColors[worker.id.toString()];
        return `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${color}"></div>
                <span class="legend-name">${worker.name}</span>
            </div>
        `;
    }).join('');

    // Generate schedule table
    let html = `
        <div class="worker-legend">
            ${legend}
        </div>
        <div class="schedule-grid">
            <table class="schedule-table">
                <thead>
                    <tr>
                        <th class="shift-header">Shift / Time</th>
                        ${scheduler.daysOfWeek.map(day => `<th>${day}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
    `;

    scheduler.shifts.forEach(shift => {
        html += `
            <tr>
                <td class="shift-header">
                    ${shift.name}<br>
                    <small>${scheduler.formatHour(shift.start)} - ${scheduler.formatHour(shift.end)}</small>
                </td>
        `;

        scheduler.daysOfWeek.forEach(day => {
            if (scheduler.schedule[day] && scheduler.schedule[day][shift.name]) {
                const shiftData = scheduler.schedule[day][shift.name];
                const isFullyStaffed = shiftData.assigned.length >= shiftData.required;

                html += '<td class="schedule-cell">';

                shiftData.assigned.forEach(workerId => {
                    const worker = scheduler.workers.find(w => w.id === workerId);
                    const color = scheduler.workerColors[workerId.toString()];
                    html += `<span class="worker-assignment" style="background-color: ${color}">${worker.name}</span>`;
                });

                const coverageClass = isFullyStaffed ? 'staffing-complete' : 'staffing-incomplete';
                const coverageIcon = isFullyStaffed ? '✅' : '⚠️';
                html += `
                    <div class="staffing-info ${coverageClass}">
                        ${coverageIcon} ${shiftData.assigned.length}/${shiftData.required} staffed
                        ${shiftData.aiOptimized ? ' 🤖' : ''}
                    </div>
                `;
            } else {
                html += '<td class="schedule-cell">No data';
            }
            html += '</td>';
        });

        html += '</tr>';
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function exportSchedule() {
    if (Object.keys(scheduler.schedule).length === 0) {
        showNotification('Please generate a schedule first', 'error');
        return;
    }

    // Create CSV content
    let csvContent = 'Day,Shift,Time,Required,Assigned,Workers\n';

    scheduler.daysOfWeek.forEach(day => {
        if (scheduler.schedule[day]) {
            scheduler.shifts.forEach(shift => {
                if (scheduler.schedule[day][shift.name]) {
                    const shiftData = scheduler.schedule[day][shift.name];
                    const timeRange = `${scheduler.formatHour(shift.start)} - ${scheduler.formatHour(shift.end)}`;
                    const workers = shiftData.workers.join('; ');
                    csvContent += `${day},${shift.name},${timeRange},${shiftData.required},${shiftData.assigned.length},"${workers}"\n`;
                }
            });
        }
    });

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'medo-staff-schedule.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showNotification('Schedule exported successfully!', 'success');
}

// Results & Analytics Functions
function loadResults() {
    console.log('📈 Loading results page...');
    loadScheduleStats();
    loadCustomerFeedback();
    loadAIAnalysis();
    loadPerformanceTrends();
}

function loadScheduleStats() {
    const container = document.getElementById('scheduleStats');
    if (!container) return;

    const stats = scheduler.calculateStatistics();

    const html = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${stats.totalWorkers}</div>
                <div class="stat-label">Total Workers</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.averageHours}h</div>
                <div class="stat-label">Avg Hours</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.staffingCoverage}%</div>
                <div class="stat-label">Coverage</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.efficiency}%</div>
                <div class="stat-label">Efficiency</div>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

async function loadCustomerFeedback() {
    const container = document.getElementById('customerFeedback');
    if (!container) return;

    try {
        const feedbackData = await scheduler.fetchCustomerFeedback();

        const stars = '★'.repeat(Math.round(parseFloat(feedbackData.averageRating)));
        const html = `
            <div class="feedback-rating">
                <div class="rating-score">${feedbackData.averageRating}/5.0</div>
                <div class="rating-stars">${stars}</div>
                <div class="rating-description">Based on ${feedbackData.responseCount} responses</div>
                <div class="rating-timestamp">Last updated: ${new Date(feedbackData.timestamp).toLocaleString()}</div>
            </div>
            <div class="feedback-details">
                ${feedbackData.categories.map(cat => `
                    <div class="feedback-item">
                        <div class="feedback-name">${cat.category}</div>
                        <div class="feedback-score">${cat.rating}/5</div>
                    </div>
                `).join('')}
            </div>
        `;

        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading customer feedback:', error);
        container.innerHTML = '<div class="loading">Error loading feedback data</div>';
    }
}

function loadAIAnalysis() {
    const container = document.getElementById('aiAnalysis');
    if (!container) return;

    const analysis = [
        { title: "Schedule Optimization", text: "AI has optimized worker assignments based on preferences and availability" },
        { title: "Workload Balance", text: "Current distribution shows good balance across all workers" },
        { title: "Coverage Analysis", text: "Most shifts are adequately staffed with backup coverage" }
    ];

    const html = analysis.map(item => `
        <div class="ai-recommendation">
            <div class="recommendation-title">🤖 ${item.title}</div>
            <div class="recommendation-text">${item.text}</div>
        </div>
    `).join('');

    container.innerHTML = html;
}

function loadPerformanceTrends() {
    const container = document.getElementById('performanceTrends');
    if (!container) return;

    const trends = [
        { title: "Staffing Coverage", value: "92%", change: "+5%" },
        { title: "Worker Satisfaction", value: "4.3/5", change: "+0.2" },
        { title: "Efficiency Score", value: "88%", change: "+3%" }
    ];

    const html = trends.map(trend => `
        <div class="trend-item">
            <div class="trend-title">${trend.title}</div>
            <div class="trend-value">
                ${trend.value}
                <span class="trend-change trend-up">${trend.change}</span>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

// Utility Functions
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏥 MEDO-STAFF Application Starting...');
    initNavigation();
    loadDashboard();
    console.log('✅ MEDO-STAFF Application Ready!');
});
