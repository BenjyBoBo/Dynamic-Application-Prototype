function getChartData(storageKey) {
    const storedData = JSON.parse(localStorage.getItem(storageKey)) || [];
    if (!storedData.length) {
        showBootstrapAlert('No Data Present', 'danger');
        return;
    }
    const labels = storedData.map(item => item.description);
    const data = storedData.map(item => item.nutrients.find(n => n.nutrientName === 'Energy').value);

    return { labels, data };
}

function calculateTotalCalories(storageKey) {
    const storedData = JSON.parse(localStorage.getItem(storageKey)) || [];
    if (!storedData.length) {
        showBootstrapAlert('No Data Present', 'danger');
        return;
    }
    return storedData.reduce((total, item) => {
        const calories = item.nutrients.find(n => n.nutrientName === 'Energy')?.value || 0;
        return total + calories;
    }, 0);
}

function displayTotalCalories() {
    const totalCalories = calculateTotalCalories('nutritionData');
    if (!totalCalories) {
        return;
    }
    const totalCaloriesContainer = document.getElementById('totalCaloriesContainer'); // Make sure you have this container in your HTML
    totalCaloriesContainer.textContent = `Total Calories: ${totalCalories}`;
}

function generateQuickChartUrl(chartData) {
    const chartConfig = {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Calories',
                data: chartData.data,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            maintainAspectRatio: false,
            aspectRatio: 1, // Adjust this to control the chart size
            layout: {
                padding: {
                    right: 100 // Adjust this value to move the chart more to the left
                }
            },
        }
    };

    const baseUrl = 'https://quickchart.io/chart';
    const url = `${baseUrl}?c=${encodeURIComponent(JSON.stringify(chartConfig))}`;
    return url;
}

function displayNutritionBarChart() {
    const chartData = getChartData('nutritionData');
    if (!chartData) {
        return;
    }
    const chartUrl = generateQuickChartUrl(chartData);

    const chartImage = new Image();
    chartImage.src = chartUrl;
    chartImage.alt = 'Nutrition Chart';

    const chartContainer = document.getElementById('chartContainer2');
    chartContainer.innerHTML = '';
    chartContainer.appendChild(chartImage);
}

function aggregateNutritionalData(storageKey) {
    const storedData = JSON.parse(localStorage.getItem(storageKey)) || [];
    if (!storedData.length) {
        showBootstrapAlert('No Data Present', 'danger');
        return;
    }
    let totalProtein = 0, totalFat = 0, totalCarbs = 0;

    storedData.forEach(item => {
        const protein = item.nutrients.find(n => n.nutrientName === 'Protein')?.value || 0;
        const fat = item.nutrients.find(n => n.nutrientName === 'Total lipid (fat)')?.value || 0;
        const carbs = item.nutrients.find(n => n.nutrientName === 'Carbohydrate, by difference')?.value || 0;

        totalProtein += protein;
        totalFat += fat;
        totalCarbs += carbs;
    });

    return { totalProtein, totalFat, totalCarbs };
}

function generateNutritionPieChartUrl(nutritionalData) {
    const chartConfig = {
        type: 'pie',
        data: {
            labels: ['Protein', 'Fat', 'Carbohydrates'],
            datasets: [{
                data: [nutritionalData.totalProtein, nutritionalData.totalFat, nutritionalData.totalCarbs],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            aspectRatio: 1, // Adjust this to control the chart size
            layout: {
                padding: {
                    right: 100 // Adjust this value to move the chart more to the left
                }
            },
        }
    };

    const baseUrl = 'https://quickchart.io/chart';
    const url = `${baseUrl}?c=${encodeURIComponent(JSON.stringify(chartConfig))}`;
    return url;
}

function displayNutritionPieChart() {
    const nutritionalData = aggregateNutritionalData('nutritionData');
    const chartUrl = generateNutritionPieChartUrl(nutritionalData);

    const chartImage = new Image();
    chartImage.src = chartUrl;
    chartImage.alt = 'Nutrition Pie Chart';

    const chartContainer = document.getElementById('chartContainer1'); // Ensure this container exists in your HTML
    chartContainer.innerHTML = '';
    chartContainer.appendChild(chartImage);
}

document.addEventListener('DOMContentLoaded', function() {
    displayNutritionPieChart();
    displayNutritionBarChart();
    displayTotalCalories();
});

function showBootstrapAlert(message, alertType) {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.classList.add('alert', `alert-${alertType}`);
    alert.textContent = message;
    alertContainer.appendChild(alert);
    setTimeout(() => {
        alert.remove();
    }, 3000);
}