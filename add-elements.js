"use strict"

const MAXLEN_CARD_INPUT = 2000;
const MAXLEN_HEADER_INPUT = 500;
const DEFAULT_INPUT_CARD_HEIGHT = "48px";

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
        inp.style.height = DEFAULT_INPUT_CARD_HEIGHT;

        inp.style.height = inp.scrollHeight + "px";
    }
});


//Клавиша Enter для полей ввода
document.addEventListener("keydown", e => {
    const inputsCl = ["input-card", "input-column"];
    const buttonsCl = [".confirm-add-card", ".confirm-add-column"];

    if (e.keyCode !== 13) { 
        return;
    }

    const t = e.target.classList;
    if (t.contains(inputsCl[0]) || t.contains(inputsCl[1])) {
        e.preventDefault();
        const btns = e.target
                      .parentElement
                      .querySelectorAll(`${ buttonsCl[0] }, ${ buttonsCl[1] }`);
        // console.log(btns)
        btns[0].click();
    }
});



function turnOnCardInput(clicked) {
    let footer = clicked.parentElement;
    let inputCardForm = footer.querySelector(".input-card-form");

    inputCardForm.classList.remove("invisible");
    clicked.classList.add("invisible");
    console.log("card input now visible");
}


function turnOffCardInput(clicked) {
    let footer = clicked.parentElement
                        .parentElement
                        .parentElement;
    let inputCardForm = footer.querySelector(".input-card-form");
    let addCard = footer.querySelector(".add-card");
    
    addCard.classList.remove("invisible");
    inputCardForm.classList.add("invisible");
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
        scrollIn(cardsList, "down");
        console.log("card created!");
    }
    inputCard.value = '';
    inputCard.style.height =  DEFAULT_INPUT_CARD_HEIGHT;
}


function addColumnInp(clicked) {
    let id = generateId("inp-col-head-");
    const colMarkup = `
        <form class="input-card-form">
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

    const main = clicked.parentElement;
    main.insertBefore(column, clicked);

    scrollIn(main, "right");
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
    
    let inputCardForm = clicked.parentElement.parentElement;
    let column = inputCardForm.parentElement;
    let id = generateId("inp-card-");
    const heading = inputCardForm.querySelector(".input-column").value;

    if (!heading) {
        return;
    }
    inputCardForm.remove();
    
    const fullColMarkup = `
        <header>
            <h1 class="column-header">${ heading }</h1>
        </header>
        <ul class="cards-list"></ul>
        <footer>
            <form class="input-card-form invisible">
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
            <button class="add-card">
                <span class="add-icon"></span>
                Добавить еще одну карточку
            </button>
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


function scrollIn(elem, dir) {
    let left = 0;
    let top = 0;
    if (dir === "down") {
        top = elem.scrollHeight;
    } else {
        left = elem.scrollWidth;
    }

    let opts = {
        left: left,
        top: top,
        behavior: 'smooth'
    }
    if (elem.scrollTo) {
        elem.scrollTo(opts);
    } else {
        elem.scrollTop = top; //Edge
        elem.scrollLeft = left; 
    }
}