document.addEventListener('DOMContentLoaded', function() {

    // Handling the nutrition form submission
    document.getElementById('submitNutritionData').addEventListener('click', function(e) {
        e.preventDefault();
        var foodItem = document.getElementById('foodInput').value;
        var amount = document.getElementById('amountFoodInput').value;
        if (!foodItem || !amount) {
            showBootstrapAlert('Please enter all required nutrition information.', 'danger');
            return; // Stop the function if data is missing
        }
        amount == 1 ? addListItemAndStore('foodList', `${foodItem} - ${amount} calorie`, 'nutritionData') : addListItemAndStore('foodList', `${foodItem} - ${amount} calories`, 'nutritionData');
    
        document.getElementById('foodInput').value = '';
        document.getElementById('amountFoodInput').value = '';
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
        addListItemAndStore('vitaminList', `${vitamin} - ${amount} mg`, 'vitaminData');

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
        sleepData.forEach(item => addListItemAndStore('sleepList', item, 'sleepData'));
        alert('Sleep data successfully submitted!');

        var sleepInputs = document.querySelectorAll('#sleepForm input');
        sleepInputs.forEach(input => input.value = '');
    });

    document.getElementById('downloadNutritionData').addEventListener('click', function(e) {
        e.preventDefault();
        downloadListDataAsJson('foodList', 'nutrition-data.json');
        showBootstrapAlert('Nutrition information downloaded.', 'success');
    });
    
    document.getElementById('downloadVitaminData').addEventListener('click', function(e) {
        e.preventDefault();
        downloadListDataAsJson('vitaminList', 'vitamin-data.json');
        showBootstrapAlert('Vitamin information downloaded.', 'success');
        
    });
    
    document.getElementById('downloadSleepData').addEventListener('click', function(e) {
        e.preventDefault();
        downloadListDataAsJson('sleepList', 'sleep-data.json');
        showBootstrapAlert('Sleep information downloaded.', 'success');
    });    

    // reset the data in the local storage and on the page
    document.getElementById('resetNutritionData').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('nutritionList');
        document.getElementById('foodList').innerHTML = '';
    });

    document.getElementById('resetVitaminData').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('vitaminList');
        document.getElementById('vitaminList').innerHTML = '';
    });

    document.getElementById('resetSleepData').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('sleepList');
        document.getElementById('sleepList').innerHTML = '';
    });
});

function addListItemAndStore(listId, content, storageKey) {
    addListItem(listId, content, storageKey);

    // Get existing data from local storage
    let storedData = JSON.parse(localStorage.getItem(storageKey)) || [];
    storedData.push(content);

    // Update local storage with new data
    localStorage.setItem(storageKey, JSON.stringify(storedData));
}

function downloadListDataAsJson(listId, filename) {
    const data = getDataFromList(listId);
    if (!data.length) {
        showBootstrapAlert('No data available to download.', 'danger');
        return;
    }

    const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(jsonBlob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}



function addListItem(listId, content, storageKey, enableEditButton = true, enableRemoveButton = true) {
    var list = document.getElementById(listId);

    // Create a new list item
    var newItem = document.createElement('li');
    newItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

    // Create a container for buttons and make it right-aligned
    var buttonContainer = document.createElement('div');
    buttonContainer.classList.add('float-right');

    // Create the "Edit" button
    if (enableEditButton) {
        var editButton = document.createElement('button');
        editButton.classList.add('btn', 'btn-primary', 'btn-sm', 'mr-1'); // Add margin-right for spacing

        // Create an image element for the edit button
        var editImg = document.createElement('img');
        editImg.src = "images/edit.png"; // Adjust the image path as needed
        editImg.style.width = "30px";
        editImg.style.height = "30px";

        // Append the image to the edit button
        editButton.appendChild(editImg);

        editButton.onclick = function() {
            // Edit the list item when the "Edit" button is clicked
            if (storageKey == 'nutritionData') {
                editListItem(this, 'foodInput', 'amountFoodInput');
            }
            else if (storageKey == 'vitaminData') {
                editListItem(this, 'vitaminInput', 'amountVitaminInput');
            }
        };
        buttonContainer.appendChild(editButton);
    }

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
    newItem.textContent = content;

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

function editListItem(button, inputFieldId, amountFieldId) {
    // Get the parent list item
    var listItem = button.parentElement.parentElement;

    // Get the current content of the list item
    var currentItemContent = listItem.textContent.trim();

    // Split the content into item and value parts
    var [item, valuePart] = currentItemContent.split(' - ');

    // Use regular expressions to extract the numeric part
    var numericValue = valuePart.match(/\d+/);

    // Remove the old list item
    listItem.parentElement.removeChild(listItem);

    // Populate the specified form fields with the previous values
    document.getElementById(inputFieldId).value = item;
    document.getElementById(amountFieldId).value = numericValue;
}


