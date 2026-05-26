const avgPercentageEl = document.getElementById('avg-percentage');
const totalMarksText = document.getElementById('total-marks-text');
const finalGradeEl = document.getElementById('final-grade');
const academicStatusEl = document.getElementById('academic-status');
const form = document.getElementById('grade-form');
const subjectNameInput = document.getElementById('subject-name');
const obtainedMarksInput = document.getElementById('obtained-marks');
const totalMarksInput = document.getElementById('total-marks');
const subjectsListEl = document.getElementById('subjects-list');
const alertBox = document.getElementById('alert-box');

let performanceChart = null;

// Загрузка сохраненных предметов из localStorage
let subjects = localStorage.getItem('subjects') !== null ? JSON.parse(localStorage.getItem('subjects')) : [];

// Функция расчета буквенной оценки
function calculateIndividualGrade(percentage) {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    if (percentage >= 50) return 'E';
    return 'F';
}

// Обработка отправки формы
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = subjectNameInput.value.trim();
    const obtained = parseFloat(obtainedMarksInput.value);
    const total = parseFloat(totalMarksInput.value);
    
    // Валидация данных
    if (obtained > total) {
        alertBox.style.display = 'block';
        alertBox.innerText = '⚠️ Error: Obtained marks cannot be greater than total marks!';
        return;
    }
    
    alertBox.style.display = 'none';
    const percentage = (obtained / total) * 100;
    
    const subject = {
        id: Math.floor(Math.random() * 1000000),
        name: name,
        obtained: obtained,
        total: total,
        percentage: percentage,
        grade: calculateIndividualGrade(percentage)
    };
    
    subjects.push(subject);
    localStorage.setItem('subjects', JSON.stringify(subjects));
    
    // Сброс полей ввода
    subjectNameInput.value = '';
    obtainedMarksInput.value = '';
    totalMarksInput.value = '';
    
    updateUI();
});

// Удаление предмета
function deleteSubject(id) {
    subjects = subjects.filter(s => s.id !== id);
    localStorage.setItem('subjects', JSON.stringify(subjects));
    updateUI();
}

// Обновление интерфейса и пересчет средних значений
function updateUI() {
    subjectsListEl.innerHTML = '';
    
    let totalObtained = 0;
    let totalMax = 0;
    
    subjects.forEach(s => {
        totalObtained += s.obtained;
        totalMax += s.total;
        
        // Добавление строки в таблицу
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${s.name}</strong></td>
            <td>${s.obtained}</td>
            <td>${s.total}</td>
            <td>${s.percentage.toFixed(1)}%</td>
            <td><span class="trend">${s.grade}</span></td>
            <td><button class="delete-row-btn" onclick="deleteSubject(${s.id})">Delete</button></td>
        `;
        subjectsListEl.appendChild(row);
    });
    
    // Расчет общих итогов
    let finalPercentage = 0;
    if (totalMax > 0) {
        finalPercentage = (totalObtained / totalMax) * 100;
    }
    
    const finalGrade = calculateIndividualGrade(finalPercentage);
    
    // Вывод данных на дашборд
    avgPercentageEl.innerText = `${finalPercentage.toFixed(1)}%`;
    totalMarksText.innerText = `${totalObtained.toFixed(1)} / ${totalMax.toFixed(1)} total marks`;
    
    if (totalMax > 0) {
        finalGradeEl.innerText = finalGrade;
        if (finalPercentage >= 50) {
            academicStatusEl.innerText = 'PASSED';
            academicStatusEl.className = 'amount status-pass';
        } else {
            academicStatusEl.innerText = 'FAILED';
            academicStatusEl.className = 'amount status-fail';
        }
    } else {
        finalGradeEl.innerText = '-';
        academicStatusEl.innerText = '-';
        academicStatusEl.className = 'amount';
    }
    
    renderChart();
}

// Отрисовка столбчатого графика успеваемости по предметам
function renderChart() {
    const labels = subjects.map(s => s.name);
    const dataValues = subjects.map(s => s.percentage);
    
    if (performanceChart) performanceChart.destroy();
    
    const ctx = document.getElementById('performanceChart').getContext('2d');
    performanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.length ? labels : ['No Data'],
            datasets: [{
                label: 'Subject Percentage (%)',
                data: dataValues.length ? dataValues : [0],
                backgroundColor: '#3b82f6',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Старт приложения
updateUI();