let fakerSeed = 123;

const batchSize = 10;
const initialBatchSize = 20;
let currentPage = 1;

const regionsData = {
    poland: {
        language: "pl",
        phoneCode: "+48",
        cities: ["Warsaw", "Krakow", "Gdansk"],
    },
    usa: {
        language: "en_US",
        phoneCode: "+1",
        cities: ["New York", "Los Angeles", "Chicago"],
    },
    georgia: {
        language: "ka",
        phoneCode: "+995",
        cities: ["Tbilisi", "Batumi", "Kutaisi"],
    },
};

function createSeededRandomGenerator(userSeed) {
    const seedNumber = parseInt(CryptoJS.MD5(userSeed + currentPage), 16);
    fakerSeed = seedNumber;
    faker.seed(seedNumber);
    Math.seedrandom(seedNumber);
    return seedNumber;
}

function loadNextPage(batchSize) {
    const region = document.getElementById("region").value;
    const userSeed = document.getElementById("seed").value || 123;
    const errorCount = parseInt(document.getElementById("errorNumber").value);

    createSeededRandomGenerator(userSeed);

    const language = regionsData[region].language;
    const phoneCode = regionsData[region].phoneCode;
    const cities = regionsData[region].cities;

    const userData = [];
    const startIndex = (currentPage - 1) * batchSize + 1;
    const endIndex = currentPage * batchSize;

    for (let i = startIndex; i <= endIndex; i++) {
        const fullName = getRandomFullName(language);
        const address = getRandomAddress(cities, language);
        const phone = getRandomPhone(phoneCode);

        const userDataWithError = applyErrors(fullName, address, phone, errorCount);

        userData.push({
            index: i,
            identifier: generateRandomIdentifier(),
            name: userDataWithError.name,
            address: userDataWithError.address,
            phone: userDataWithError.phone,
        });
    }

    if (currentPage === 1) {
        currentPage++;
        currentPage++;
    } else {
        currentPage++;
    }

    updateTable(userData);
}

function generateData() {
    currentPage = 1;
    loadNextPage(initialBatchSize);
}

function applyErrors(name, address, phone, errorCount) {
    let userDataWithError = {
        name,
        address,
        phone,
    };

    for (let i = 0; i < errorCount; i++) {
        const randomErrorType = getRandomInt(1, 3);
        switch (randomErrorType) {
            case 1:
                userDataWithError = deleteRandomCharacter(userDataWithError);
                break;
            case 2:
                userDataWithError = addRandomCharacter(userDataWithError);
                break;
            case 3:
                userDataWithError = swapNearCharacters(userDataWithError);
                break;
        }
    }

    return userDataWithError;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function deleteRandomCharacter(userData) {
    const randomPosition = getRandomInt(0, userData.name.length - 1);
    userData.name =
        userData.name.substring(0, randomPosition) +
        userData.name.substring(randomPosition + 1);
    return userData;
}

function addRandomCharacter(userData) {
    const randomPosition = getRandomInt(0, userData.name.length);
    const randomCharacter = String.fromCharCode(getRandomInt(97, 122));
    userData.name =
        userData.name.substring(0, randomPosition) +
        randomCharacter +
        userData.name.substring(randomPosition);
    return userData;
}

function swapNearCharacters(userData) {
    const randomPosition = getRandomInt(0, userData.name.length - 2);
    userData.name =
        userData.name.substring(0, randomPosition) +
        userData.name.charAt(randomPosition + 1) +
        userData.name.charAt(randomPosition) +
        userData.name.substring(randomPosition + 2);
    return userData;
}

function generateRandomIdentifier() {
    return Math.random().toString(36).substr(2, 8);
}

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}


function getRandomFullName(language) {
    const firstName = faker.name.findName(undefined, undefined, undefined, language, "first");
    const lastName = faker.name.findName(undefined, undefined, undefined, language, "last");
    const middleName = faker.name.findName(undefined, undefined, undefined, language, "middle");

    switch (language) {
        case "pl":
            return `${firstName} ${middleName} ${lastName}`;
        case "ka":
            return `${firstName} ${middleName} ${lastName}`;
        default:
            return `${firstName} ${middleName} ${lastName}`;
    }
}


function getRandomAddress(cities, language) {
    const city = getRandomElement(cities);
    const street = faker.address.streetName();
    const building = getRandomInt(1, 100);
    const apartment = getRandomInt(1, 20);
    return language === "ka"
        ? `${city}, ${street}, ${building}`
        : `${city}, ${street}, ${building}, Apt ${apartment}`;
}

function getRandomPhone(phoneCode) {
    const randomDigits = Math.floor(Math.random() * 1000000000)
        .toString()
        .padStart(9, "0");
    return `${phoneCode} ${randomDigits}`;
}

function updateErrorNumber() {
    const errorSlider = document.getElementById("errorSlider");
    const errorNumber = document.getElementById("errorNumber");
    errorNumber.value = errorSlider.value;
    generateData();
}

function updateErrorSlider() {
    const errorSlider = document.getElementById("errorSlider");
    const errorNumber = document.getElementById("errorNumber");
    errorSlider.value = errorNumber.value;
    generateData();
}

function updateSeed() {
    generateData();
}

function generateRandomSeed() {
    const seed = Math.floor(Math.random() * 1000000);
    document.getElementById("seed").value = seed;
    generateData();
}

function exportToCSV() {
    const userData = getUserData();
    const csvContent =
        "data:text/csv;charset=utf-8," +
        "Index,Random Identifier,Name,Address,Phone\n" +
        userData.map((row) => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "user_data.csv");
    document.body.appendChild(link);
    link.click();
}

function updateTable(userData) {
    const tableBody = document.getElementById("userData");
    userData.length === 20 && (tableBody.innerHTML = "");
    userData.forEach((row) => {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `<td>${row.index}</td><td>${row.identifier}</td><td>${row.name}</td><td>${row.address}</td><td>${row.phone}</td>`;
        tableBody.appendChild(newRow);
    });
}

function getUserData() {
    const tableBody = document.getElementById("userData");
    const rows = tableBody.querySelectorAll("tr");
    const userData = [];

    rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        userData.push({
            index: cells[0].innerText,
            identifier: cells[1].innerText,
            name: cells[2].innerText,
            address: cells[3].innerText,
            phone: cells[4].innerText,
        });
    });

    return userData;
}

window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        loadNextPage(batchSize);
    }
});

window.onload = function () {
    updateSeed();
    generateData();
};
