document.addEventListener('DOMContentLoaded', function() {

    populateListFromStorage('foodList', 'nutritionData');
    populateListFromStorage('vitaminList', 'vitaminData');
    populateListFromStorage('sleepList', 'sleepData');

    document.getElementById('submitSearch').addEventListener('click', async function(e) {
        e.preventDefault();
    
        var foodItem = document.getElementById('searchInput').value;
        if (!foodItem) {
            showBootstrapAlert('Please enter a food item.', 'danger');
            return;
        }
    
        const apiKey = '1enrXcz4c84Isd7XbNoGKuCAGutss5LkgIsYEGQq'; // Replace with your actual API key
    
        try {
            const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(foodItem)}&api_key=${apiKey}`);
            const data = await response.json();
            var resultList = document.getElementById('searchResults');
            resultList.innerHTML = '';
            
            // Create and append items to the list
            data.foods.forEach(food => {
                const foodObject = createFoodObject(food);

                var listItem = document.createElement('li');
                listItem.innerHTML = `<span>${foodObject.description}</span> - ` +
                `<span>Calories: ${getNutrientValue(foodObject, 'Energy', '0')}</span> | ` +
                `<span>Protein: ${getNutrientValue(foodObject, 'Protein', 'N/A')}</span> | ` +
                `<span>Carbohydrates: ${getNutrientValue(foodObject, 'Carbohydrate, by difference', 'N/A')}</span> | ` +
                `<span>Fat: ${getNutrientValue(foodObject, 'Total lipid (fat)', 'N/A')}</span>`;
            
                function getNutrientValue(foodObject, nutrientName, defaultValue) {
                    const nutrient = foodObject.nutrients.find(n => n.nutrientName === nutrientName);
                    return nutrient ? nutrient.value : defaultValue;
                }

                listItem.addEventListener('click', function() {
                    const foodObject = JSON.parse(this.dataset.foodObject);
                    addListItemAndStore('foodList', foodObject, 'nutritionData');
                });
                listItem.dataset.foodObject = JSON.stringify(foodObject);
                resultList.appendChild(listItem);
            });
        } catch (error) {
            showBootstrapAlert('Failed to fetch nutrition data.', 'danger');
            console.error('Error fetching nutrition data:', error);
        }
    });

    document.getElementById('submitNutritionData').addEventListener('click', function(e) {
        e.preventDefault();
        var foodItem = document.getElementById('foodInput').value;
        var calories = document.getElementById('amountFoodInput').value;
        var protien = document.getElementById('protienInput').value;
        var carbs = document.getElementById('carbsInput').value;
        var fat = document.getElementById('fatInput').value;
    
        if (!foodItem || !calories) {
            showBootstrapAlert('Please enter all required nutrition information.', 'danger');
            return;
        }
    
        // Create a structured object similar to the API data structure
        var foodObject = {
            description: foodItem,
            nutrients: 
            [
                {
                    nutrientId: 1008,
                    nutrientName: 'Energy',
                    value: parseFloat(calories),
                    unitName: 'KCAL'
                },
                {
                    nutrientId: 1003,
                    nutrientName: 'Protein',
                    value: parseFloat(protien),
                    unitName: 'G'
                },
                {
                    nutrientId: 1005,
                    nutrientName: 'Carbohydrate, by difference',
                    value: parseFloat(carbs),
                    unitName: 'G'
                },
                {
                    nutrientId: 1004,
                    nutrientName: 'Total lipid (fat)',
                    value: parseFloat(fat),
                    unitName: 'G'
                }
            ],
        };
    
        addListItemAndStore('foodList', foodObject, 'nutritionData');
    
        document.getElementById('foodInput').value = '';
        document.getElementById('amountFoodInput').value = '';
        document.getElementById('protienInput').value = '';
        document.getElementById('carbsInput').value = '';
        document.getElementById('fatInput').value = '';
    });
    
    
    // Handling the vitamin form submission
    document.getElementById('submitVitaminData').addEventListener('click', function(e) {
        e.preventDefault();
        var vitamin = document.getElementById('vitaminInput').value;
        var amount = document.getElementById('amountVitaminInput').value;
        if (!vitamin || !amount) {
            showBootstrapAlert('Please enter all required vitamin information.', 'danger');
            return; // Stop the function if data is missing
        }

        var vitaminObject = {
            description: vitamin,
            vitamin: 
            [
                {
                    nutrientName: vitamin,
                    value: parseFloat(amount),
                    unitName: 'MG'
                }
            ],
        };
        addListItemAndStore('vitaminList', vitaminObject, 'vitaminData');

        document.getElementById('vitaminInput').value = '';
        document.getElementById('amountVitaminInput').value = '';
    });

    // Handling the sleep tracking form submission
    document.getElementById('submitSleepData').addEventListener('click', function(e) {
        e.preventDefault();
        var sleepData = [];
        for (var i = 1; i <= 7; i++) {
            var sleepHours = document.getElementById('sleepDay' + i).value;
            if (!sleepHours) {
                showBootstrapAlert('Please enter all required sleep information.', 'danger');
                return; // Stop the function if data is missing
            }
            sleepData.push(`Night ${i}: ${sleepHours} hours`);
        }
        sleepData.forEach(item => addSleepData(item));
        alert('Sleep data successfully submitted!');

        var sleepInputs = document.querySelectorAll('#sleepForm input');
        sleepInputs.forEach(input => input.value = '');
    });

    document.getElementById('downloadNutritionData').addEventListener('click', function(e) {
        e.preventDefault();
        downloadListDataAsJson('nutritionData', 'nutrition-data.json');
    });
    
    document.getElementById('downloadVitaminData').addEventListener('click', function(e) {
        e.preventDefault();
        downloadListDataAsJson('vitaminData', 'vitamin-data.json');
    });
    
    document.getElementById('downloadSleepData').addEventListener('click', function(e) {
        e.preventDefault();
        downloadListDataAsJson('sleepData', 'sleep-data.json');
    });     

    document.getElementById('resetNutritionData').addEventListener('click', function(e) {
        e.preventDefault();
        resetData('nutritionData', 'foodList');
    });
    
    document.getElementById('resetVitaminData').addEventListener('click', function(e) {
        e.preventDefault();
        resetData('vitaminData', 'vitaminList');
    });
    
    document.getElementById('resetSleepData').addEventListener('click', function(e) {
        e.preventDefault();
        resetData('sleepData', 'sleepList');
    });
});

function addSleepData(amount) {
    // Store the sleep data in local storage
    var sleepData = JSON.parse(localStorage.getItem('sleepData')) || [];
    sleepData.push(amount);
    localStorage.setItem('sleepData', JSON.stringify(sleepData));
}

function downloadSleepData() {
    // Get the sleep data from local storage
    var sleepData = JSON.parse(localStorage.getItem('sleepData')) || [];
    if (!sleepData.length) {
        showBootstrapAlert('No sleep data available to download.', 'danger');
        return;
    }

    // Create a blob from the sleep data
    const jsonBlob = new Blob([JSON.stringify(sleepData)], { type: 'application/json' });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(jsonBlob);
    a.download = 'sleep-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showBootstrapAlert('Sleep data downloaded.', 'success');
}

function downloadListDataAsJson(storageKey, filename) {
    const storedData = JSON.parse(localStorage.getItem(storageKey)) || [];

    if (storedData.length === 0) {
        showBootstrapAlert('No data available to download.', 'danger');
        return;
    }

    // Format the JSON with an indentation of 2 spaces
    const formattedJson = JSON.stringify(storedData, null, 2);

    const jsonBlob = new Blob([formattedJson], { type: 'application/json' });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(jsonBlob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showBootstrapAlert('Information downloaded.', 'success');
}



function addListItemAndStore(listId, healthObject, storageKey) {
    addListItem(listId, healthObject, storageKey);

    // Get existing data from local storage
    let storedData = JSON.parse(localStorage.getItem(storageKey)) || [];
    storedData.push(healthObject);

    // Update local storage with new data
    localStorage.setItem(storageKey, JSON.stringify(storedData));
}


function addListItem(listId, healthObject, enableRemoveButton = true) {
    var list = document.getElementById(listId);

    // Create a new list item
    var newItem = document.createElement('li');
    newItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

    // Create a container for buttons and make it right-aligned
    var buttonContainer = document.createElement('div');
    buttonContainer.classList.add('float-right');

    // Create the "Remove" button
    if (enableRemoveButton) {
        var removeButton = document.createElement('button');
        removeButton.classList.add('btn', 'btn-danger', 'btn-sm');

        // Create an image element for the remove button
        var removeImg = document.createElement('img');
        removeImg.src = "images/trash.png"; // Adjust the image path as needed
        removeImg.style.width = "30px";
        removeImg.style.height = "30px";

        // Append the image to the remove button
        removeButton.appendChild(removeImg);

        removeButton.onclick = function() {
            // Remove the list item when the "Remove" button is clicked
            list.removeChild(newItem);
        };
        buttonContainer.appendChild(removeButton);
    }

    // Set the text content of the list item to the provided content
    // check if the healthObject is a food object or a vitamin object
    if (healthObject.nutrients) {
        newItem.textContent = `${healthObject.description} - Calories: ${healthObject.nutrients.find(n => n.nutrientName === 'Energy').value}`;
    } else {
        newItem.textContent = `${healthObject.description} - ${healthObject.vitamin.find(n => n.nutrientName === healthObject.description).value}`;
    }

    // Append the button container to the list item
    newItem.appendChild(buttonContainer);

    // Append the list item to the list
    list.appendChild(newItem);
}

function showBootstrapAlert(message, type = 'success') {
    const alertPlaceholder = document.getElementById('alertPlaceholder');
    const alert = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
                       ${message}
                       <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                           <span aria-hidden="true">&times;</span>
                       </button>
                   </div>`;
    alertPlaceholder.innerHTML = alert;
}

function resetData(storageKey, listId) {
    // Clear the data in local storage
    localStorage.removeItem(storageKey);

    // Clear the corresponding list in the UI
    var listElement = document.getElementById(listId);
    if (listElement) {
        while (listElement.firstChild) {
            listElement.removeChild(listElement.firstChild);
        }
    }

    // Optionally, display a success alert
    showBootstrapAlert('Data has been reset successfully.', 'success');
}

function getDataFromList(listId) {
    const list = document.getElementById(listId);
    const items = list.getElementsByTagName('li');
    const dataList = Array.from(items).map(item => item.textContent);
    return dataList;
}

function removeListItem(button) {
    var listItem = button.parentElement; // Get the parent list item
    var list = listItem.parentElement; // Get the parent list
    list.removeChild(listItem); // Remove the list item
}

function removeItemFromStorage(storageKey, index) {
    let storedData = JSON.parse(localStorage.getItem(storageKey)) || [];
    storedData.splice(index, 1); // Remove the item at the specified index
    localStorage.setItem(storageKey, JSON.stringify(storedData)); // Update local storage
}

function createFoodObject(foodData) {
    return {
        fdcId: foodData.fdcId,
        description: foodData.description,
        dataType: foodData.dataType,
        gtinUpc: foodData.gtinUpc,
        publishedDate: foodData.publishedDate,
        brandOwner: foodData.brandOwner,
        brandName: foodData.brandName,
        ingredients: foodData.ingredients,
        marketCountry: foodData.marketCountry,
        foodCategory: foodData.foodCategory,
        modifiedDate: foodData.modifiedDate,
        dataSource: foodData.dataSource,
        packageWeight: foodData.packageWeight,
        servingSizeUnit: foodData.servingSizeUnit,
        servingSize: foodData.servingSize,
        nutrients: foodData.foodNutrients.map(nutrient => ({
            nutrientId: nutrient.nutrientId,
            nutrientName: nutrient.nutrientName,
            value: nutrient.value,
            unitName: nutrient.unitName
        })),
    };
}

function populateListFromStorage(listId, storageKey) {
    const listElement = document.getElementById(listId);
    const storedData = JSON.parse(localStorage.getItem(storageKey)) || [];

    storedData.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
        // if the item is a vitamin object, then display the vitamin value
        if (item.vitamin) {
            listItem.textContent = `${item.description} - ${item.vitamin.find(n => n.nutrientName === item.description).value}`;
        } else if (item.nutrients) {
            listItem.textContent = `${item.description} - Calories: ${item.nutrients.find(n => n.nutrientName === 'Energy').value}`;
        } else {
            return;
        }
        
        // Create a container for buttons and make it right-aligned
        var buttonContainer = document.createElement('div');
        buttonContainer.classList.add('float-right');

        // Create the "Remove" button
        var removeButton = document.createElement('button');
        removeButton.classList.add('btn', 'btn-danger', 'btn-sm');

        // Create an image element for the remove button
        var removeImg = document.createElement('img');
        removeImg.src = "images/trash.png"; // Adjust the image path as needed
        removeImg.style.width = "30px";
        removeImg.style.height = "30px";

        // Append the image to the remove button
        removeButton.appendChild(removeImg);

        // Event handler for the remove button
        removeButton.onclick = function() {
            // Remove from the list
            listElement.removeChild(listItem);

            // Remove from local storage
            removeItemFromStorage(storageKey, index);
        };
        
        buttonContainer.appendChild(removeButton);
        listItem.appendChild(buttonContainer);
        listElement.appendChild(listItem);
    });
}

