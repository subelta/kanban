
class DragScope {
    constructor(dragClass, dropFieldClass, extDropFieldClass, highlightClass, dragStyleClass) {

        this.dragClass = dragClass;
        this.dropFieldClass = dropFieldClass;
        this.extDropFieldClass = extDropFieldClass; 
        this.highlightClass = highlightClass;
        this.dragStyleClass = dragStyleClass;

        this.elemObject = {};
        this.dropPlace = false;
        this.defScrollState = {
            interval: undefined,
            target: undefined
        }

        //listeners
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseOver = this.onMouseOver.bind(this);
        this.defaultScroll = this.defaultScroll.bind(this);


        this.saveSizes = this.saveSizes.bind(this);
        this.setDropPlace = this.setDropPlace.bind(this);
        this.startDrag = this.startDrag.bind(this);
        this.dropElement = this.dropElement.bind(this);
        this.isDropPlaceBefore = this.isDropPlaceBefore.bind(this);
        this.findDropZone = this.findDropZone.bind(this);
        this.manageScroll = this.manageScroll.bind(this);

        this.startListening();
    }

    startListening() {
        document.addEventListener("mousemove", this.onMouseMove);
        document.addEventListener("mouseup", this.onMouseUp); 
        document.addEventListener("mousedown", this.onMouseDown);
        document.addEventListener("mouseover", this.onMouseOver);
        document.addEventListener("mousemove", this.defaultScroll);
    }

    
    onMouseDown(e) {
        let element = e.target.closest("." + this.dragClass);
    
        if ((e.button != 0) || (!element)){ 
            return; 
        } 
    
        this.elemObject.el = element;
        //начальные коориднаты зажатия
        this.elemObject.init = { 
            x: e.pageX, 
            y: e.pageY
        }; 
        // return false;
    }


    onMouseMove(e) {
        if (!this.elemObject.el) {
            return;
        }  
    
        if(!this.elemObject.isDragged) {
            const move = {
                x: Math.abs(e.pageX - this.elemObject.init.x),
                y: Math.abs(e.pageY - this.elemObject.init.y) 
            }
            if (move.x < 3 && move.y < 3) {
                return;
            }
        
            // shift.x/shift.y - разница между координатами левого верхнего угла и точкой зажатия
            const coords = this.elemObject.el.getBoundingClientRect();
            this.elemObject.shift = {
                x: this.elemObject.init.x - coords.left,
                y: this.elemObject.init.y - coords.top
            }
            //сохраняем изначальные (вычисленные) размеры элемента в тч padding и border-width (для dropPlace)
            this.saveSizes(); 
            this.setDropPlace();
            this.startDrag();
            this.elemObject.isDragged = true;
        }
    
        //перенос объекта при каждом движении мыши
        this.elemObject.el.style.left = e.pageX - this.elemObject.shift.x + 'px'; 
        this.elemObject.el.style.top = e.pageY - this.elemObject.shift.y + 'px';
        unFocus();
        // return false;
    }


    onMouseUp() {
        if (this.elemObject.isDragged) {
            this.dropElement();  
        }
        this.dropPlace = false;
        this.elemObject = {};
        // return false;
    }


    onMouseOver(e) {
        const el = this.elemObject.el;
        const target = e.target;  
      
        if ((!el) || (target == this.dropPlace)) {
            return;
        }   
    
        if (e.relatedTarget.classList.contains(this.dragClass)) {
            return;
        }
    
        const isSibling = target.classList.contains(this.dragClass);
        const extField = target.closest('.' + this.extDropFieldClass);
    
        if (isSibling) {
            if(this.isDropPlaceBefore(target)) {
                insertAfter(this.dropPlace, target);
            } else {
                target.parentElement.insertBefore(this.dropPlace, target);        
            }
            return false;
        } 
    
        if (extField) {  
            const dropZone = this.findDropZone(extField);
            if (dropZone) {
                dropZone.appendChild(this.dropPlace);
            }
        }
        // return false;
    }

    
    
    defaultScroll(e) {    
        let state = this.manageScroll(
            this.defScrollState.interval, 
            e, 
            this.defScrollState.target, 
            this.dropFieldClass, 
            "y"
        );
        if (state) {
            this.defScrollState.interval = state.interval;
            this.defScrollState.target = state.currTarg;
        }
    }
    


    saveSizes() {
        const el = this.elemObject.el;
        const elStyle = window.getComputedStyle(el);
      
        this.elemObject.size = {
            width: elStyle.getPropertyValue('width'),
            height: elStyle.getPropertyValue('height'),
            padding: elStyle.getPropertyValue('padding'),
            borderWidth: elStyle.getPropertyValue('border-width')
        }  
    }


    setDropPlace() {
        const el = this.elemObject.el;
      
        if (!this.dropPlace) {
            this.dropPlace = document.createElement(el.tagName);
            this.dropPlace.classList.add(this.highlightClass, this.dragClass);
            let drop = this.dropPlace.style;
            const size = this.elemObject.size;
            
            drop.height = size.height;//рефакторить с for in foo of************************
            drop.width = size.width;
            drop.padding = size.padding;
            drop.borderWidth = size.borderWidth;
        }
        this.elemObject.el.parentElement.insertBefore(this.dropPlace, this.elemObject.el);
    }


    startDrag() {
        let el = this.elemObject.el;
        this.elemObject.oldZindex = el.style.zIndex;
        this.elemObject.el.style.pointerEvents = 'none';
        
        el.style.height = this.elemObject.size.height;
        el.style.width = this.elemObject.size.width;
        el.style.zIndex = 9999;
        el.style.position = 'fixed';
        if (this.dragStyleClass) {
            el.classList.add(this.dragStyleClass);
        }
      
        document.body.appendChild(el);
    }


    dropElement() {
        let el = this.elemObject.el;
      
        el.style.pointerEvents = 'auto';
        el.style.position = "static";
        el.style.height = '';
        el.style.width = '';
        if (this.dragStyleClass) {
            el.classList.remove(this.dragStyleClass);
        }
        this.elemObject.el.style.zIndex = this.elemObject.oldZindex;
      
        this.dropPlace.replaceWith(el);
    }


    isDropPlaceBefore(target) {
        let prev = target.previousElementSibling;

        while (prev) {
            if(prev == this.dropPlace) {
                return true;
            }
            prev = prev.previousElementSibling;
        }
        return false;
    }


    findDropZone(extField) {
        let inside = extField.querySelector("." + this.dropFieldClass);
        let isEqual = extField.classList.contains(this.dropFieldClass); 
      
        const dropZone = inside ? inside :
                         isEqual ? extField : null;
        return dropZone;
    }


    manageScroll(interval, e, currTarg, elemClass, dir) {
        if (!interval) {

            if (!e.target.closest("." + elemClass)) {
                return;
            };

            currTarg = e.target.closest("." + elemClass);
            const hover = this.scrollArea(e, currTarg, dir);
          
            if (hover && this.elemObject.isDragged) { 
                // console.log(hover);
                interval = this.startScroll(interval, currTarg, hover);
                // console.log(interval);
            }
            return {interval, currTarg};
        }

        if (interval) {
            if (!this.scrollArea(e, currTarg, dir) || !this.elemObject.isDragged) {
                // console.log(`targ: ${currTarg.tagName}`);
                // console.log(`area: ${this.scrollArea(e, currTarg, dir)}`);
                // console.log(`stop: ${interval}`);
                this.stopScroll(interval);
                interval = undefined;
            }
            return {interval, currTarg};
        }
    }


    scrollArea(e, el, axis) {
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


    startScroll(scrollId, scrollScope, dir) {
        scrollId = window.setInterval(this.incrementScroll, 20, scrollScope, dir);
        return scrollId;
    }
        
      
    stopScroll(scrollId) {
        clearInterval(scrollId);
    }
      
      
    incrementScroll(scrollScope, direction) {
        switch(direction) {
            case "left":
                scrollScope.scrollLeft -= 7;
                break;
            case "right":
                scrollScope.scrollLeft += 7;
                break;
            case "up":
                scrollScope.scrollTop -= 7;
                break;
            case "down":
                scrollScope.scrollTop += 7;
                break;
        }
    }
}



function unFocus() {
    if (document.selection) {
      document.selection.empty()
    } else {
      window.getSelection().removeAllRanges()
    }
} 
  

function insertAfter(elem, refElem) {
    return refElem.parentNode.insertBefore(elem, refElem.nextElementSibling);
}