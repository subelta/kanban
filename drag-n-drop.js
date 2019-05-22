"use strict"
/**
 * [DragScope]
 * @param  {[String]} dragClass [HTML класс перетаскиваемого элемента]
 * @param  {[String]} dropFieldClass [HTML класс элемента, куда может быть добавлен перетаскиваемый элемент]
 * @param  {[String]} extDropFieldClass [HTML класс элемента, при наведении на который подсвечивается место в dropFieldClass и возможен перенос 
 *                                     (внутри него должен быть ОДИН dropFieldClass)]
 * @param  {[String]} highlightClass [HTML класс со стилями для подсветки свободного для перетаскивания места]
 * @param  {[String]} dragStyleClass [HTML класс со стилями для отображения переносимого елемента]
 * @return {[undefined]}
 */
var DragScope = function(dragClass, dropFieldClass, extDropFieldClass, highlightClass, dragStyleClass) {
  var elemObject = {};
  var dropPlace = false;


  function onMouseDown(e) {
    let element = e.target.closest("." + dragClass);

    if ((e.button != 0) || (!element)){ 
        return; 
    } 

    elemObject.el = element;
    //начальные коориднаты зажатия
    elemObject.init = { 
      x: e.pageX, 
      y: e.pageY
    }; 
    return false;
  }



  function onMouseMove(e) {
    // элемент не зажат
    if (!elemObject.el) {
      return;
    }  

    if(!elemObject.isDragged) {
      const move = {
        x: Math.abs(e.pageX - elemObject.init.x),
        y: Math.abs(e.pageY - elemObject.init.y) 
      }
      if (move.x < 3 && move.y < 3) {
        return;
      }
    
      // shift.x/shift.y - разница между координатами левого верхнего угла и точкой зажатия
      const coords = elemObject.el.getBoundingClientRect();
      elemObject.shift = {
        x: elemObject.init.x - coords.left,
        y: elemObject.init.y - coords.top
      }
      //сохраняем изначальные (вычисленные) размеры элемента в тч padding и border-width (для dropPlace)
      elemObject = saveSizes(elemObject); 

      dropPlace = setDropPlace(elemObject, dragClass, highlightClass);
      elemObject = startDrag(elemObject, dragStyleClass);
      elemObject.isDragged = true;
    }

    //перенос объекта при каждом движении мыши
    elemObject.el.style.left = e.pageX - elemObject.shift.x + 'px'; 
    elemObject.el.style.top = e.pageY - elemObject.shift.y + 'px';
    unFocus();
    return false;
  }



  function onMouseUp() {
    if (elemObject.isDragged) {
      dropElement(elemObject, dropPlace, dragStyleClass);  
    }
    dropPlace = false;
    elemObject = {};
    return false;
  }



  function onMouseOver(e) {
    const el = elemObject.el;
    const target = e.target;  
  
    if ((!el) || (target == dropPlace)) {
      return;
    }
    //
    

    if (e.relatedTarget.classList.contains(dragClass)) {
      // console.log(e.relatedTarget);
      // console.log("realated target contains dragClass");
      return;
    }

    const isSibling = target.classList.contains(dragClass);
    const extField = target.closest('.' + extDropFieldClass)
                   
    if (isSibling) {
      if(dropPlaceBefore(target, dropPlace)) {
        insertAfter(dropPlace, target);
      } else {
        target.parentElement.insertBefore(dropPlace, target);        
      }
      // console.log("inserted");
    } else if (extField) {
      let dropZone = extField.querySelector("." + dropFieldClass) ||
                     extField;
      dropZone.appendChild(dropPlace);
    }
    return false;
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp); 
  document.addEventListener("mousedown", onMouseDown);
  document.addEventListener("mouseover", onMouseOver);
};




function saveSizes(elemObject) {
  const el = elemObject.el;
  const elStyle = window.getComputedStyle(el);

  elemObject.width = elStyle.getPropertyValue('width');
  elemObject.height = elStyle.getPropertyValue('height');
  elemObject.padding = elStyle.getPropertyValue('padding');
  elemObject.borderWidth = elStyle.getPropertyValue('border-width');
  
  return elemObject;
}



function startDrag(elemObject, dragStyleClass) {
  let el = elemObject.el;
  elemObject.oldZindex = el.style.zIndex;
  elemObject.el.style.pointerEvents = 'none';
  
  el.style.height = elemObject.height;
  el.style.width = elemObject.width;
  el.style.zIndex = 9999;
  el.style.position = 'fixed';
  if (dragStyleClass) {
    el.classList.add(dragStyleClass);
  }

  document.body.appendChild(el);
  return elemObject;
}



function dropElement(elemObject, dropPlace, dragStyleClass) {
  let el = elemObject.el;

  el.style.pointerEvents = 'auto';
  el.style.position = "static";
  el.style.height = '';
  el.style.width = '';
  if (dragStyleClass) {
    el.classList.remove(dragStyleClass);
  }
  elemObject.el.style.zIndex = elemObject.oldZindex;

  dropPlace.replaceWith(el);
}



function setDropPlace(elemObject, dragClass, highlightClass) {
  const el = elemObject.el;
  let dropPlace; 

  if (!dropPlace) {
    dropPlace = document.createElement(el.tagName);
    dropPlace.classList.add(highlightClass, dragClass);
    dropPlace.style.height = elemObject.height;
    dropPlace.style.width = elemObject.width;
    dropPlace.style.padding = elemObject.padding;
    dropPlace.style.borderWidth = elemObject.borderWidth;
  }
  elemObject.el.parentElement.insertBefore(dropPlace, elemObject.el);
  return dropPlace;
}


function dropPlaceBefore(target, dropPlace) {
  let prev = target.previousSibling;
  while (prev) {
    if(prev == dropPlace) {
      return true;
    }
    prev = prev.previousSibling;
  }
  return false;
}



function insertAfter(elem, refElem) {
  return refElem.parentNode.insertBefore(elem, refElem.nextSibling);
}

//убрать выделение текста
var unFocus = function () {
  if (document.selection) {
    document.selection.empty()
  } else {
    window.getSelection().removeAllRanges()
  }
} 