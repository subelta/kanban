"use strict"

document.addEventListener("click", function(e) {
    let clicked = e.target;
    const buttons = {
        "add-card": turnOnCardInput, 
        "confirm-add-card": createCard, 
        "discard-add-card": turnOffCardInput, 
        "add-column": addColumnInp,
        "confirm-add-column": generateColumn, 
        "discard-add-column": deleteColumnInp
    };
    
    for (let btn in buttons) {
        if(clicked.classList.contains(btn)) {
            buttons[btn](clicked);
        }
    }
});



function turnOnCardInput(clicked) {
    let footer = clicked.parentElement;
    let inputSection = footer.querySelector(".input-section");

    inputSection.classList.remove("invisible");
    clicked.classList.add("invisible");
    console.log("card input now visible");
}


function turnOffCardInput(clicked) {
    let footer = clicked.parentElement
                        .parentElement
                        .parentElement;
    let inputSection = footer.querySelector(".input-section");
    let addCard = footer.querySelector(".add-card");
    
    addCard.classList.remove("invisible");
    inputSection.classList.add("invisible");
    console.log("card input now invisible");
}


function createCard(clicked) {
    let footer = clicked.parentElement
                        .parentElement
                        .parentElement;
    let cardsList = footer.previousElementSibling;
    let inputCard = clicked.parentElement
                           .previousElementSibling;

    const cardText = inputCard.value.trim();
    if (cardText) {
        let card = document.createElement("li");
        card.classList.add("card");
        card.textContent = cardText;

        cardsList.appendChild(card);
        console.log("card created!");
    }
    inputCard.value = '';
}


function addColumnInp(clicked) {
    const colMarkup = `
        <section class="input-section">
            <input 
                class="input-column" 
                type="text" 
                name="column-name" 
                placeholder="Введите название колонки">
            <section class="controls">
                <button class="confirm-add-column">Добавить колонку</button>
                <span class="discard-add-column"></span>
            </section>
        </section>
    `
    let column = document.createElement("article");
    column.classList.add("column");
    column.innerHTML = colMarkup;
    clicked.parentElement
           .insertBefore(column, clicked);

    console.log("column input created");
}


function deleteColumnInp(clicked) {
    clicked.parentElement
           .parentElement
           .parentElement
           .remove();
    console.log("column input deleted");
}


function generateColumn(clicked) {
    let inputSection = clicked.parentElement
                              .parentElement;
    let column = inputSection.parentElement;

    const heading = inputSection.firstElementChild.value;
    if (!heading) {
        return;
    }
    
    inputSection.remove();
    const fullColMarkup = `
        <header>
            <h1 class="column-header">${ heading }</h1>
        </header>
        <ul class="cards-list"></ul>
        <footer>
            <section class="input-section invisible">
                <textarea 
                    class="input-card" 
                    name="card-content" 
                    placeholder="Введите название карточки"
                ></textarea>
                <section class="controls">
                    <button class="confirm-add-card">Добавить карточку</button>
                    <span class="discard-add-card"></span>
                </section>
            </section>
            <button class="add-card">Добавить еще одну карточку</button>
        </footer>
    `

    column.innerHTML = fullColMarkup;
    console.log("column markup generated");
}





