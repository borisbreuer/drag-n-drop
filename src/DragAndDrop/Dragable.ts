type Vector = {
    y: number;
    x: number;
};

export type Options = {
    placeholder?: HTMLDivElement;
    dropzone?: HTMLDivElement;
};

enum SpecialClassNames {
    behind = 'diagonale-ru',
    before = 'diagonale-lo',
    dragging = 'dragging',
}

export class Dragable {
    element: HTMLElement;
    isDragging: boolean;
    mouseDownOffsetX: number;
    mouseDownOffsetY: number;
    pos: Vector;
    mouse: Vector;
    win: Vector;
    elements: NodeListOf<HTMLElement>;
    options: Options;
    placeHolder: HTMLElement;

    constructor(el: HTMLElement, els: NodeListOf<HTMLElement>, options: Options = {}) {
        this.element = el;
        this.elements = els;
        this.isDragging = false;
        this.mouseDownOffsetX = 0;
        this.mouseDownOffsetY = 0;
        this.pos = { x: 0, y: 0 };
        this.mouse = { x: 0, y: 0 };
        this.win = { x: 0, y: 0 };
        this.placeHolder = document.createElement('div');
        this.options = options;
        this.init();
    }

    private move(event: MouseEvent) {
        this.element.classList.add(SpecialClassNames.dragging);

        this.mouse.x = event.pageX;
        this.mouse.y = event.pageY;

        this.pos.x = this.mouse.x - this.mouseDownOffsetX;
        this.pos.y = this.mouse.y - this.mouseDownOffsetY;

        this.element.style.left = `${this.pos.x}px`;
        this.element.style.top = `${this.pos.y}px`;

        this.intersect();
        this.scroll();
    }

    private intersect() {
        this.elements.forEach((item) => {
            if (item === this.element) return;
            const itemBox = item.getBoundingClientRect();

            const withinLtoR = this.mouse.x > itemBox.left + window.scrollX && this.mouse.x < itemBox.right + window.scrollX;
            const withinTtoB = this.mouse.y > itemBox.top + window.scrollY && this.mouse.y < itemBox.bottom + window.scrollY;
            const forwardDiagonalCheck = this.mouse.x - itemBox.left > Math.abs(this.mouse.y - (itemBox.top + window.scrollY) - itemBox.height);
            // const backwardDiagonalCheck = this.mouse.x - itemBox.left > Math.abs(this.mouse.y - (itemBox.top + window.scrollY));

            if (withinLtoR && withinTtoB) {
                if (forwardDiagonalCheck) {
                    this.placeElement(item, this.placeHolder, 'afterend');
                    item.classList.add(SpecialClassNames.behind);
                    item.classList.remove(SpecialClassNames.before);
                } else {
                    this.placeElement(item, this.placeHolder, 'beforebegin');
                    item.classList.add(SpecialClassNames.before);
                    item.classList.remove(SpecialClassNames.behind);
                }
            } else {
                item.classList.remove(SpecialClassNames.behind);
                item.classList.remove(SpecialClassNames.before);
            }
        });
    }

    private resetIntersect() {
        this.elements.forEach((item) => {
            item.classList.remove(SpecialClassNames.behind);
            item.classList.remove(SpecialClassNames.before);
        });
    }

    private scroll() {
        console.log(window.scrollY + this.win.y, document.body.offsetHeight);
        if (this.mouse.y < window.scrollY) {
            window.scrollBy(0, -5);
        }
        if (window.scrollY + this.win.y >= document.body.offsetHeight) return;
        if (this.mouse.y > this.win.y + window.scrollY) {
            window.scrollBy(0, 5);
        }
    }

    private downHandler(event: MouseEvent) {
        if (event.button !== 0) return;

        this.isDragging = true;
        this.placeElement(this.element, this.placeHolder, 'afterend');

        this.addListener();

        this.mouseDownOffsetX = event.offsetX;
        this.mouseDownOffsetY = event.offsetY;

        this.move(event);
    }

    private upHandler() {
        this.isDragging = false;
        this.element.classList.remove(SpecialClassNames.dragging);

        this.removeListener();

        this.element.style.removeProperty('top');
        this.element.style.removeProperty('left');

        if (!this.element.getAttribute('style')) this.element.removeAttribute('style');

        this.resetIntersect();

        this.placeElement(this.placeHolder, this.element, 'afterend');
        this.placeHolder.remove();
    }

    private moveHandler(event: MouseEvent) {
        if (!this.isDragging) return;
        this.move(event);
    }

    private init() {
        this.downHandler = this.downHandler.bind(this);
        this.upHandler = this.upHandler.bind(this);
        this.moveHandler = this.moveHandler.bind(this);
        this.winSize = this.winSize.bind(this);

        this.element.addEventListener('mousedown', this.downHandler);
        this.element.addEventListener('contextmenu', (event: Event) => event.preventDefault());
        this.winSize();
        window.addEventListener('resize', this.winSize);

        this.placeHolder.classList.add('placeholder');
    }

    private addListener() {
        document.addEventListener('mouseup', this.upHandler);
        document.addEventListener('mousemove', this.moveHandler);
    }

    private removeListener() {
        document.removeEventListener('mouseup', this.upHandler);
        document.removeEventListener('mousemove', this.moveHandler);
    }

    private winSize() {
        this.win.x = window.innerWidth;
        this.win.y = window.innerHeight;
    }

    private placeElement(item: HTMLElement, target: HTMLElement, position: InsertPosition) {
        item.insertAdjacentElement(position, target);
    }
}
