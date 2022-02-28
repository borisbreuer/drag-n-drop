import { Dragable, Options } from './Dragable';

export class DragAndDropController {
    selector: string;

    constructor(querySelector: string) {
        this.selector = querySelector;

        this.init();
    }

    private init() {
        const items: NodeListOf<HTMLDivElement> = document.querySelectorAll(this.selector)!;
        items.forEach((item) => new Dragable(item, items));
    }
}
