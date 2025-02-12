// Start highlighting the element under the mouse
export function startElementHighlight(color="yellow") {

  console.log("Starting highlighter");
  const body = document.body;
  if (!body) {
    console.log("WTF");
    throw new Error("asdfka");
  }

  /**
   * This object encapsulates the elements and actions of the overlay.
   */
  class Overlay {
    top: HTMLDivElement;
    bottom: HTMLDivElement;
    left: HTMLDivElement;
    right: HTMLDivElement;
    outer: HTMLDivElement;

    constructor() {
      // outer parent
      this.outer = document.createElement("div");
      this.outer.style.position = "absolute"
      this.outer.style.top = "0"
      this.outer.style.left = "0"
      this.outer.style.zIndex = "65000";
      body.appendChild(this.outer);

      const createAndAppend = (css: string, val: number) => {
        const el = document.createElement('div');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        el.style[css] = `${val}px`;
        el.style.position = "absolute";
        el.style.background = color;
        this.outer.appendChild(el);
        return el;
      }

      // red lines (boxes)
      this.top = createAndAppend('height', 2);
      this.bottom = createAndAppend('height', 2);
      this.left = createAndAppend('width', 2);
      this.right = createAndAppend('width', 2);
    }
    /**
     * Public interface
     */

    show() {
      this.outer.style.display = "normal";
      // this.outer.show();
    }

    hide() {
      this.outer.style.display = "none";
    }

    render(width: number, height: number, left: number, top: number) {

      this.top.style.top = `${top}px`;
      this.top.style.left = `${left}px`;
      this.top.style.width = `${width}px`;

      this.bottom.style.top = `${top + height - 1}px`;
      this.bottom.style.left = `${left}px`;
      this.bottom.style.width = `${width}px`;

      this.left.style.top = `${top}px`;
      this.left.style.left = `${left}px`;
      this.left.style.height = `${height}px`;

      this.right.style.top = `${top}px`;
      this.right.style.left = `${left + width - 1}px`;
      this.right.style.height = `${height}px`;

      this.show();
    }

    setColor(color: string) {
      this.top.style.background = color;
      this.bottom.style.background = color;
      this.left.style.background = color;
      this.right.style.background = color;
    }
  }

  const box = new Overlay();

  const listener = ({ x, y }: {x: number, y: number}) => {
    if (__clickAction == "click") {
      box.hide();
      window.removeEventListener("mousemove", listener);
    }
    const els = document.elementsFromPoint(x, y);
    for (const el of els) {
      if (el == box.outer || el == box.top || el == box.right || el == box.left || el == box.bottom) {
        continue
      }

      const color = (__clickTypeFilter && !(new RegExp(__clickTypeFilter).test(el.nodeName)))
        ? "grey"
        : "yellow";
      box.setColor(color);

      const rect = el.getBoundingClientRect()
      box.render(rect.width, rect.height, rect.left + window.scrollX, rect.top + window.scrollY);
      break;
    }
  }
  window.addEventListener("mousemove", listener);
  // When capturing values, do not propagate clicks

  const stopPropagation = (ev: MouseEvent) => {
    if (__clickAction == "value") {
      ev.stopPropagation();
      ev.stopImmediatePropagation();
      ev.preventDefault();
    }
    window.removeEventListener("click", stopPropagation, true);
  }
  window.addEventListener("click", stopPropagation, true);
}
