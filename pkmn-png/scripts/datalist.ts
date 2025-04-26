
fetch("https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0")
    .then(async (response) => {
        const data = await response.json();
        const names = data.results.map((datum: any) => datum.name);
        const dataList = document.createElement("datalist");
        dataList.setAttribute("id", "pokemonNames");
        for (const name of names) {
            const option = document.createElement("option");
            option.innerHTML = name;
            option.setAttribute("value", name);
            dataList.appendChild(option);
        }
        document.getElementById("app")?.appendChild(dataList);
        const nameInput = document.getElementById("name-input");
        nameInput?.setAttribute("list", "pokemonNames");
        mountApp(names);
    });