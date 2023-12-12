const mineralNames = ['Calcium', 'Iron', 'Magnesium', 'Phosphorus', 'Potassium', 'Sodium', 'Zinc', 'Copper', 'Manganese', 'Selenium'];
const vitaminNames = ['Vitamin A', 'Vitamin B6', 'Vitamin B12', 'Vitamin C', 'Vitamin D', 'Vitamin E', 'Vitamin K', 'Thiamin', 'Riboflavin', 'Niacin', 'Folate', 'Choline'];

function getStoredFoodData() {
    return JSON.parse(localStorage.getItem('nutritionData')) || [];
}

function getStoredVitaminData() {
    return JSON.parse(localStorage.getItem('vitaminData')) || [];
}

function combineVitaminData(foodVitamins, inputtedVitamins) {
    // Create a mapping of vitamin names to their respective data in foodVitamins
    const foodVitaminMap = {};
    foodVitamins.forEach(vitamin => {
        foodVitaminMap[vitamin.description] = vitamin;
    });
    inputtedVitamins.forEach(vitamin => {
        if (foodVitaminMap[vitamin.vitamin[0].nutrientName]) {
            foodVitaminMap[vitamin.vitamin[0].nutrientName].value += vitamin.vitamin[0].value;
        } else {
            foodVitaminMap[vitamin.vitamin[0].nutrientName] = vitamin.vitamin[0];
        }
    });

    console.log(foodVitaminMap);
    // Combine the data from foodVitamins and inputtedVitamins
    const combinedVitamins = [];

    // Process vitamins from inputtedVitamins
    if (inputtedVitamins.vitamin && inputtedVitamins.vitamin[0] && inputtedVitamins.vitamin[0].value) {

        const inputtedVitamin = inputtedVitamins.vitamin[0];
        const vitaminName = inputtedVitamin.description || inputtedVitamins.description;
        const vitaminUnit = inputtedVitamin.unitName || inputtedVitamins.unitName;
        const dosage = inputtedVitamin.value;

        // If the vitamin name exists in foodVitamins, convert units if needed
        if (foodVitaminMap[vitaminName]) {
            const foodVitamin = foodVitaminMap[vitaminName];
            if (foodVitamin.unitName !== vitaminUnit) {
                // Convert dosage to the unit used in foodVitamins
                // You would need to implement the unit conversion logic here
                // For now, let's assume no conversion is needed
            }
            // Use the dosage from foodVitamins
            const combinedDosage = foodVitamin.value;
            combinedVitamins.push({ description: vitaminName, value: combinedDosage, unitName: vitaminUnit });
        } else {
            // If the vitamin name doesn't exist in foodVitamins, add it as is
            combinedVitamins.push({ description: vitaminName, value: dosage, unitName: vitaminUnit });
        }
    }

    // Add vitamins from foodVitamins that were not included above
    foodVitamins.forEach(foodVitamin => {
        if (!combinedVitamins.some(combinedVitamin => combinedVitamin.description === foodVitamin.description)) {
            combinedVitamins.push(foodVitamin);
        }
    });

    return combinedVitamins;
}


function displayVitaminData(vitaminData) {
    const vitaminListElement = document.getElementById('vitaminList');
    vitaminListElement.innerHTML = ''; // Clear existing content

    vitaminData.forEach(vitamin => {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item');
        listItem.textContent = `Vitamin: ${vitamin.description}, Dosage: ${(Math.round(vitamin.value * 100) / 100) } mg`;        
        vitaminListElement.appendChild(listItem);
    });
}

function aggregateVitaminData(foodData) {
    const vitaminTotals = {};
    const vitaminUnits = {};
    foodData.forEach(item => {
        item.nutrients.forEach(nutrient => {
            if ((nutrient.nutrientName.includes('Vitamin') || mineralNames.includes(nutrient.nutrientName))
                && nutrient.value > 0) {
                
                if (nutrient.nutrientName.includes('Vitamin')) {
                    nutrient.nutrientName = nutrient.nutrientName.slice(0, nutrient.nutrientName.indexOf(' ') + 2);
                }
                if (!vitaminTotals[nutrient.nutrientName]) {
                    vitaminTotals[nutrient.nutrientName] = 0;
                }

                // convert everything to mg
                if (nutrient.unitName === 'UG') {
                    nutrient.value /= 1000;
                } else if (nutrient.unitName === 'G') {
                    nutrient.value *= 1000;
                }
                vitaminTotals[nutrient.nutrientName] += nutrient.value;
                vitaminUnits[nutrient.nutrientName] = nutrient.unitName;      
            }
        });
    });

    return Object.entries(vitaminTotals).map(([nutrientName, value]) => {
        const unitName = vitaminUnits[nutrientName];
        return { description: nutrientName, value: value, unitName: unitName.toLowerCase()};
    });
}

function generateVitaminPieChartUrl(vitaminTotals) {
    const labels = vitaminTotals.map(vitamin => vitamin.description);
    const data = Object.values(vitaminTotals).filter(vitamin => vitamin.value > 0).map(vitamin => (Math.round(vitamin.value * 100) / 100));

    const chartConfig = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                label: 'Vitamin amounts in milligrams',
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

function displayVitaminPieChart(combinedVitaminData) {
    const chartUrl = generateVitaminPieChartUrl(combinedVitaminData);

    const chartImage = new Image();
    chartImage.src = chartUrl;
    chartImage.alt = 'Vitamin Pie Chart';

    const chartContainer = document.getElementById('vitaminChartContainer');
    chartContainer.innerHTML = '';
    chartContainer.appendChild(chartImage);
}

document.addEventListener('DOMContentLoaded', function() {
    const vitaminData = getStoredVitaminData();
    const foodData = getStoredFoodData();
    if (!vitaminData) {
        showBootstrapAlert('No Data Present', 'danger');
        return;
    }
    const foodVitamins = aggregateVitaminData(foodData);
    const combinedVitaminData = combineVitaminData(foodVitamins, vitaminData);
    displayVitaminData(combinedVitaminData);
    displayVitaminPieChart(combinedVitaminData);
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