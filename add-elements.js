"use strict"

const MAXLEN_CARD_INPUT = 2000;
const MAXLEN_HEADER_INPUT = 500;

document.addEventListener("click", e => {
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
            buttons[btn](clicked, e);
        }
    }
});


//ресайз textfield'a
document.addEventListener("input", e => { 
    if (e.target.classList.contains("input-card")) {
        let inp = e.target;
        inp.style.height = "inherit";

        inp.style.height = inp.scrollHeight + "px";
    }
});


//Enter для полей ввода
document.addEventListener("keydown", e => {
    const inputsCl = ["input-card", "input-column"];
    const buttonsCl = [".confirm-add-card", ".confirm-add-column"];


    if (e.keyCode !== 13) { 
        return;
    }

    e.preventDefault();

    const t = e.target.classList;
    if (t.contains(inputsCl[0]) || t.contains(inputsCl[1])) {
        const btns = e.target
                      .parentElement
                      .querySelectorAll(`${ buttonsCl[0] }, ${ buttonsCl[1] }`);
        // console.log(btns)
        btns[0].click();
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


function createCard(clicked, e) {
    let footer = clicked.parentElement
                        .parentElement
                        .parentElement;
    let cardsList = footer.previousElementSibling;
    let inputCard = clicked.parentElement
                           .previousElementSibling;
    e.preventDefault();

    const cardText = inputCard.value.trim();
    if (cardText) {
        let card = document.createElement("li");
        card.classList.add("card");
        card.textContent = cardText;

        cardsList.appendChild(card);
        console.log("card created!");
    }
    inputCard.value = '';
    inputCard.style.height = "inherit";
}


function addColumnInp(clicked) {
    let id = generateId("inp-col-head-");
    const colMarkup = `
        <form class="input-section">
            <label for=${id} class="sr-only"> <!--Доступность-->
                Введите название колонки 
            </label>
            <input 
                id=${id}
                class="input-column" 
                type="text" 
                name="column-name" 
                placeholder="Введите название колонки"
                maxlength="${MAXLEN_HEADER_INPUT}">
            <section class="controls">
                <button class="confirm-add-column">Добавить колонку</button>
                <span class="discard-add-column"></span>
            </section>
        </form>
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


function generateColumn(clicked, e) {
    e.preventDefault();
    
    let inputSection = clicked.parentElement.parentElement;
    let column = inputSection.parentElement;
    let id = generateId("inp-card-");
    const heading = inputSection.querySelector(".input-column").value;

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
            <form class="input-section invisible">
                <label for=${id} class="sr-only"> <!--Доступность-->
                    Введите название карточки
                </label>
                <textarea
                    id=${id} 
                    class="input-card" 
                    name="card-content" 
                    placeholder="Введите название карточки"
                    maxlength="${ MAXLEN_CARD_INPUT }"
                ></textarea>
                <section class="controls">
                    <button class="confirm-add-card">Добавить карточку</button>
                    <span class="discard-add-card"></span>
                </section>
            </form>
            <button class="add-card">Добавить еще одну карточку</button>
        </footer>
    `

    column.innerHTML = fullColMarkup;
    console.log("column markup generated");
}


function generateId(prefix) {
    let id, check;

    do {
        const min = 10000;
        const max = 99999;
        id = prefix + Math.floor(Math.random() * (max - min) + min);
        check = document.querySelector("#" + id);
    } while(check)

    return id;
}