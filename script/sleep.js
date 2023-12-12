document.addEventListener('DOMContentLoaded', function() {
    displaySleepChart();
});


function displaySleepChart() {
    const sleepData = aggregateSleepData('sleepData');
    if (!sleepData) {
        return;
    }
    const chartUrl = generateSleepChartUrl(sleepData);

    const chartImage = new Image();
    chartImage.src = chartUrl;
    chartImage.alt = 'Sleep Chart';

    const chartContainer = document.getElementById('chartContainer1'); // Ensure this container exists in your HTML
    chartContainer.innerHTML = '';
    chartContainer.appendChild(chartImage);
}

function aggregateSleepData(storageKey) {
    const sleepData = JSON.parse(localStorage.getItem(storageKey));
    if (!sleepData) {
        showBootstrapAlert('No Data Present', 'danger');
        return;
    }
    const sleepTotals = {};

    sleepData.forEach(sleep => {
        const [night, hours] = sleep.split(':');
        sleepTotals[night] = parseFloat(hours.trim().split(' ')[0]);
    });

    return Object.entries(sleepTotals).map(([day, hours]) => {
        return { day: day, hours: hours };
    });
}

function generateSleepChartUrl(sleepTotals) {
    const labels = sleepTotals.map(sleep => sleep.day);
    const data = sleepTotals.map(sleep => sleep.hours);
    console.log(data);
    const chartConfig = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                label: 'Sleep hours',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
    };

    const baseUrl = 'https://quickchart.io/chart';
    const url = `${baseUrl}?c=${encodeURIComponent(JSON.stringify(chartConfig))}`;
    return url;
}

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