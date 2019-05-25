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

    if (e.relatedTarget.classList.contains(dragClass)) {
      return;
    }

    const isSibling = target.classList.contains(dragClass);
    const extField = target.closest('.' + extDropFieldClass);

    if (isSibling) {
      if(dropPlaceBefore(target, dropPlace)) {
        insertAfter(dropPlace, target);
      } else {
        target.parentElement.insertBefore(dropPlace, target);        
      }
      return false;
    } 

    if (extField) {  
      const dropZone = findDropZone(extField, dropFieldClass);
      if (dropZone) {
        dropZone.appendChild(dropPlace);
      }
    }
    return false;
  }


  function manageScroll(interval, e, currTarg, elemClass, dir) {
    if (!interval) {
      if (!e.target.closest("." + elemClass)) {
        return;
      };
      currTarg = e.target.closest("." + elemClass);
      const hover = scrollArea(e, currTarg, dir);
    
      if (hover && elemObject.isDragged) { 
        console.log(hover);
        interval = startScroll(interval, currTarg, hover);
        console.log(interval);
      }
      return {interval, currTarg};
    }

  
    if (interval) {
      if (!scrollArea(e, currTarg, dir) || !elemObject.isDragged) {
        console.log(`targ: ${currTarg.tagName}`);
        console.log(`area: ${scrollArea(e, currTarg, dir)}`);
        console.log(`stop: ${interval}`);
        stopScroll(interval);
        interval = undefined;
      }
      return {interval, currTarg};
    }
  }

  
  document.addEventListener("mousemove", onMouseMove);//рефакторить с for in for of************************
  document.addEventListener("mouseup", onMouseUp); 
  document.addEventListener("mousedown", onMouseDown);
  document.addEventListener("mouseover", onMouseOver);
  
  let columnInt;
  let target;

  let mainInt;
  let mainTarg;

  document.addEventListener("mousemove", e => {
    let colState = manageScroll(columnInt, e, target, dropFieldClass, "y");
    if (colState) {
      columnInt = colState.interval;
      target = colState.currTarg;
    }

    let mainState = manageScroll(mainInt, e, mainTarg, "horiz-scroll", "x");
    if (mainState) {
      mainInt = mainState.interval;
      mainTarg = mainState.currTarg;
    }
  });  
};




function saveSizes(elemObject) {
  const el = elemObject.el;
  const elStyle = window.getComputedStyle(el);

  elemObject.size = {
    width: elStyle.getPropertyValue('width'),
    height: elStyle.getPropertyValue('height'),
    padding: elStyle.getPropertyValue('padding'),
    borderWidth: elStyle.getPropertyValue('border-width')
  }
  
  return elemObject;
}



function startDrag(elemObject, dragStyleClass) {
  let el = elemObject.el;
  elemObject.oldZindex = el.style.zIndex;
  elemObject.el.style.pointerEvents = 'none';
  
  el.style.height = elemObject.size.height;
  el.style.width = elemObject.size.width;
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
    let drop = dropPlace.style;
    const size = elemObject.size;

    drop.height = size.height;//рефакторить с for in foo of************************
    drop.width = size.width;
    drop.padding = size.padding;
    drop.borderWidth = size.borderWidth;
  }
  elemObject.el.parentElement.insertBefore(dropPlace, elemObject.el);
  return dropPlace;
}


function dropPlaceBefore(target, dropPlace) {
  let prev = target.previousElementSibling;
  while (prev) {
    if(prev == dropPlace) {
      return true;
    }
    prev = prev.previousElementSibling;
  }
  return false;
}


function findDropZone(extField, dropFieldClass) {
  let inside = extField.querySelector("." + dropFieldClass);
  let isEqual = extField.classList.contains(dropFieldClass); 

  const dropZone = inside ? inside :
                   isEqual ? extField : null;
  return dropZone;
}


function insertAfter(elem, refElem) {
  return refElem.parentNode.insertBefore(elem, refElem.nextElementSibling);
}


//убрать выделение текста
var unFocus = function () {
  if (document.selection) {
    document.selection.empty()
  } else {
    window.getSelection().removeAllRanges()
  }
} 

//********************************************************************************************************************************************* */

function startScroll(scrollId, scrollScope, dir) {
  scrollId = window.setInterval(incrementScroll, 20, scrollScope, dir);
  return scrollId;
}
  

function stopScroll(scrollId) {
  clearInterval(scrollId);
}


function incrementScroll(scrollScope, direction) {
  switch(direction) {
    case "left":
        scrollScope.scrollLeft -= 10;
        break;
    case "right":
        scrollScope.scrollLeft += 10;
        break;
    case "up":
        scrollScope.scrollTop -= 10;
        break;
    case "down":
        scrollScope.scrollTop += 10;
        break;
  }
}


function scrollArea(e, el, axis) {
  let elStyle = window.getComputedStyle(el);
  const part = 10;
  

  const coords = {
    top: el.getBoundingClientRect().top,
    left: el.getBoundingClientRect().left,
  }

  let w = elStyle.getPropertyValue("width");
  let pl = elStyle.getPropertyValue("padding-left");
  let pr  = elStyle.getPropertyValue("padding-right");
  let h = elStyle.getPropertyValue("height");
  let pt = elStyle.getPropertyValue("padding-top");
  let pb  = elStyle.getPropertyValue("padding-bottom");

  w = +w.substr(0, w.length-2);
  pl = +pl.substr(0, pl.length-2);
  pr = +pr.substr(0, pr.length-2);
  h = +h.substr(0, h.length-2);
  pt = +pt.substr(0, pt.length-2);
  pb = +pb.substr(0, pb.length-2);
  
  const sumX = w + pl + pr;
  const sumY = h + pt + pb;


  if (axis === "x"){

    if ((coords.left + sumX / part >= e.clientX) && 
        (coords.left <= e.clientX)) {
          return "left";
    } 

    if ((coords.left + (part - 1) * sumX / part <= e.clientX) && 
        (coords.left + sumX >= e.clientX)) {
          return "right";
    } 
  }

  if (axis === "y") {
    

    if ((coords.top + sumY / part >= e.clientY) && 
        (coords.top <= e.clientY)) {
          return "up";
    } 

    if ((coords.top + (part - 1) * sumY / part <= e.clientY) && 
        (coords.top + sumY >= e.clientY)) {
          return "down";
    } 
  }
  return false;
}
