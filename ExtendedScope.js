
class ExtendedScope extends DragScope {
    constructor(dragClass, dropFieldClass, extDropFieldClass, highlightClass, dragStyleClass) {
        super(
            dragClass, 
            dropFieldClass, 
            extDropFieldClass, 
            highlightClass, 
            dragStyleClass
        );

        this.scrollMain = {
            interval: undefined,
            currTarget: undefined
        }

        this.scrollColumn = {
            interval: undefined,
            currTarget: undefined
        }

        this.customScroll = this.customScroll.bind(this);
        document.addEventListener("mousemove", this.customScroll);
    }

    customScroll(e) {
        let mainScroll = this.manageScroll(
            this.scrollMain.interval, 
            e, 
            this.scrollMain.target, 
            "horiz-scroll", 
            "x"
        );
        if (mainScroll) {
            this.scrollMain.interval = mainScroll.interval;
            this.scrollMain.target = mainScroll.currTarg;
        }

        let columnScroll = this.manageScroll(
            this.scrollColumn.interval, 
            e, 
            this.scrollColumn.target, 
            this.extDropFieldClass, 
            "y"
        );
        if (columnScroll) {
            this.scrollColumn.interval = columnScroll.interval;
            this.scrollColumn.target = columnScroll.currTarg;
        }
    }
}


