let detailContainer = document.getElementById('detail-div-container');
let detailDiv = document.getElementById('detail-div');
let itemContainer = document.getElementById('food-list');
let searchBox = document.getElementById('search-box');
let errorDiv = document.getElementById('error-div');
let toast = document.getElementById('toast');
let toastBody = document.getElementById('toast-body');


detailContainer.addEventListener('click', () => {
    closeDetailPopup();

});

detailDiv.addEventListener('click', (event) => {
    // do nothing
    event.stopImmediatePropagation();
})

searchBox.addEventListener('keyup', (event) => {
    if (event.code === 'Enter') {
        makeFoodSearchRequest();
    }
})

document.getElementById('search-btn').addEventListener('click', () => {
    makeFoodSearchRequest();

})

function makeFoodSearchRequest() {
    itemContainer.innerHTML = '';

    let searchItem = searchBox.value.trim().replace(' ', '_').toLowerCase();
    if (searchItem.length > 0) {
        errorDiv.innerHTML = '';
        showToast("Fetching food items of your choice.");
        searchMeals(searchItem, (meals) => {
            putMealsInView(meals);
            hideToast();
            searchBox.value = '';
        }, (error) => {
            errorDiv.innerHTML = error.message;
            hideToast();
        });
    } else {
        errorDiv.innerHTML = 'You need to input something to search.';
    }
}

function showToast(message = "Please Wait") {
    toastBody.innerText = message;
    toast.classList.remove('d-none')
    toast.classList.add('d-block')
}

function hideToast() {
    toast.classList.remove('d-block')
    toast.classList.add('d-none')
}


function closeDetailPopup() {
    detailDiv.innerHTML = '';
    detailContainer.classList.remove('detail-container-show');
    detailContainer.classList.add('detail-container-hide');
}


async function putMealsInView(meals) {
    if (meals != null && meals.meals != null && meals.meals.length > 0) {
        meals.meals.forEach(meal => putFoodItemInView(meal));
    } else {
        errorDiv.innerHTML = 'Unfortunately we could not find what you are looking for.';
    }
}

function onItemClick(meal) {
    detailDiv.innerHTML = '';
    showToast(`Fetching details of ${meal.strMeal}`);
    fetchMealById(meal.idMeal, (meals) => {
        if (meals != null && meals.meals != null && meals.meals.length > 0) {
            detailContainer.classList.remove('detail-container-hide');
            detailContainer.classList.add('detail-container-show');
            populateDetailsOfItem(meals.meals[0]);
        } else {
            showToast("Unfortunately we could not find what you are looking for.");
            setTimeout(() => {
                hideToast()
            }, 3000)
        }
        hideToast()
    }, (error) => {
        showToast(error.message);
        setTimeout(() => {
            hideToast()
        }, 3000)
    })
}

function searchMeals(token, onResponse, onError) {
    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${token}`).then(data => data.json()).then(meals => onResponse(meals)).catch(error => onError(error));
}

function fetchMealById(id, onResponse, onError) {
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`).then(data => data.json()).then(meals => onResponse(meals)).catch(error => onError(error));
}

function putFoodItemInView(meal) {
    const div = document.createElement('div');
    div.style.width = '18rem';
    div.innerHTML = `
    <div style="text-align: center;">
        <img class="shadow-sm" style="object-fit: cover; max-width: 100%; height: auto; border-radius: 8px;"
            src="${meal.strMealThumb}" alt="" srcset=""> <br>
        <b>${meal.strMeal}</b>
    </div>
    `
    div.addEventListener('click', () => {
        onItemClick(meal);
    })
    itemContainer.appendChild(div)
}

function youtube_parser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
}

async function populateDetailsOfItem(meal) {
    let div = document.createElement('div');
    div.classList.add('m-4');
    let youtubeData;
    if (meal.strYoutube != null && meal.strYoutube.length > 0) {
        youtubeData = `
            <iframe class="w-75" style="height: 400px;" src="${"https://youtube.com/embed/" + youtube_parser(meal.strYoutube)}"></iframe>
        `
    } else {
        youtubeData = ""
    }

    let ingradients = ""
    for (const prop in meal) {
        if (prop.startsWith('strIngredient')) {
            if (meal[prop] != null && meal[prop].length > 0) {
                let ingradient = meal[prop];
                ingradients += `<div style="width: 120px; text-align: center;">
                    <img src="https://www.themealdb.com/images/ingredients/${ingradient}.png" style="max-width: 100%; object-fit:cover; margin: 0 auto;"> <br>
                    <b class="text-capitalize">${ingradient}</b>
                </div>`
            }
        }
    }

    div.innerHTML = `
        <i onclick="closeDetailPopup()" class="fa fa-times-circle fa-lg"
            style="position: sticky; top: 12px; left: 12px; width: 48px; height: 48px; z-index: 12; --fa-primary-color: #ffffff; --fa-secondary-color: #100e16; --fa-secondary-opacity: 1;"></i>
        <div class="row row-cols-1 row-cols-md-2">
            <div class="col justify-content-center" style="max-width: 250px;">
                <img class="rounded shadow-sm" style="max-width: 100%; margin: 8px auto;"
                    src="${meal.strMealThumb}" alt="">
            </div>
            <div class="col">
                <h4 class="text-center">Ingradients</h4>
                <div class="d-flex flex-column flex-md-row flex-wrap align-items-center justify-content-center">
                    ${ingradients}
                </div>
            </div>
        </div>

        <div class="text-center my-5">
            <h2>Instructions</h2>
            <p>Source: <a target="_blank" href="${meal.strSource}">${meal.strSource}</a></p>
            <p>${meal.strInstructions.replace("\r", "<br>").replace("\n", "<br>")}</p>
            ${youtubeData}
        </div >
    `
    detailDiv.appendChild(div);
}