import { decode, encode } from 'he';
/**
 * Node Class as base class for TextNode and HTMLElement.
 */
export default class Node {
    constructor(parentNode = null, range) {
        this.parentNode = parentNode;
        this.childNodes = [];
        Object.defineProperty(this, 'range', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: range !== null && range !== void 0 ? range : [-1, -1]
        });
    }
    get innerText() {
        return this.rawText;
    }
    get textContent() {
        return decode(this.rawText);
    }
    set textContent(val) {
        this.rawText = encode(val);
    }
}
