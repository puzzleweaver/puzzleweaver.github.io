"use strict";
fetch("https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0")
    .then(async (response) => {
    var _a;
    const data = await response.json();
    const names = data.results.filter((datum) => {
        console.log(datum);
        return true;
    }).map((datum) => datum.name);
    const dataList = document.createElement("datalist");
    dataList.setAttribute("id", "pokemonNames");
    for (const name of names) {
        const option = document.createElement("option");
        option.innerHTML = name;
        option.setAttribute("value", name);
        dataList.appendChild(option);
    }
    (_a = document.getElementById("app")) === null || _a === void 0 ? void 0 : _a.appendChild(dataList);
    const nameInput = document.getElementById("name-input");
    nameInput === null || nameInput === void 0 ? void 0 : nameInput.setAttribute("list", "pokemonNames");
    mountApp(names);
});
