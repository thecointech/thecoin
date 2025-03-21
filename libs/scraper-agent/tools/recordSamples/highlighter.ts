// Start highlighting the element under the mouse
export function initElementHighlight(border_size=5, color="rgba(255, 0, 0, 0.5)") {

  console.log("Starting highlighter");
  const body = document.body;
  if (!body) {
    console.log("WTF");
    throw new Error("asdfka");
  }

  if (globalThis.__highlighter) {
    return;
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
      this.top = createAndAppend('height', border_size);
      this.bottom = createAndAppend('height', border_size);
      this.left = createAndAppend('width', border_size);
      this.right = createAndAppend('width', border_size);
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

      this.bottom.style.top = `${top + height - (border_size / 2)}px`;
      this.bottom.style.left = `${left}px`;
      this.bottom.style.width = `${width}px`;

      this.left.style.top = `${top}px`;
      this.left.style.left = `${left}px`;
      this.left.style.height = `${height}px`;

      this.right.style.top = `${top}px`;
      this.right.style.left = `${left + width - (border_size / 2)}px`;
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

  globalThis.__highlighter = new Overlay();
}

export function setElementHighlight(element: HTMLElement) {
  const box = globalThis.__highlighter;
  // First, clear the highlight to reset any page offsets caused
  box.hide();
  const rect = element.getBoundingClientRect()
  box.render(rect.width, rect.height, rect.left + window.scrollX, rect.top + window.scrollY);
}

export function clearHighlight() {
  const box = globalThis.__highlighter;
  box.hide();
}

// export function getAllInputs() {
//   const all = Array.from(document.querySelectorAll<HTMLElement>('input, select'));
//   return all.filter(i =>
//     i.checkVisibility({
//       checkOpacity: true,  // Check CSS opacity property too
//       checkVisibilityCSS: true // Check CSS visibility property too
//     })
//   )
// }

// export function getCoordsWithMargin(element: HTMLElement) {
//   const box = element.getBoundingClientRect();
//   const styles = element.computedStyleMap();

//   const tryGetValue = (prop: string) => {
//     //@ts-ignore `value` is not part of the spec, but it appears to always be there in px
//     // const value = styles.get(prop)?.value;
//     // if (value) {
//     //   const r = parseInt(value, 10);
//     //   if (!Number.isNaN(r)) {
//     //     return r;
//     //   }
//     // }
//     return 0;
//   }

//   const marginTop = tryGetValue("margin-top");
//   const marginBottom = tryGetValue("margin-bottom");
//   const marginLeft = tryGetValue("margin-left");
//   const marginRight = tryGetValue("margin-right");
//   // We want the height/width of the content, so ignore padding
//   const height = box.height + (marginTop + marginBottom);
//   const width = box.width + (marginLeft + marginRight);
//   return {
//     top: box.top + window.scrollY - marginTop,
//     left: box.left + window.scrollX - marginLeft,
//     centerY: box.top + window.scrollY + (height / 2),
//     height,
//     width,
//   };
// }

// export function mapInputToParent(element: HTMLElement) {
//   const elementCoords = window.getCoords(element);
//   let bestParent = element;
//   const maxWidth = window.innerWidth / 2;

//   while (bestParent) {
//     const nextParent = bestParent.parentElement;
//     const nextCoords = window.getCoords(nextParent);

//     // Check if parent is oversized compared to the input.  We try to include neighbouring labels, but don't
//     // want to extend over to much of the page.
//     if (nextCoords.height > elementCoords.height * 3 || nextCoords.width > maxWidth) {
//       break;
//     }

//     // Break if the parent contains any other inputs
//     const inputs = Array.from(
//       nextParent.querySelectorAll('input, select, form')
//     );
//     if (inputs.length !== 1) {
//       break;
//     }
//     bestParent = nextParent;
//   }
//   return bestParent;
// }

export function mapInputToParentCoords(element: HTMLElement) {
}
// export function mapInputsToParents(elements: HTMLElement[]) {
//   return elements.map(element => {

//   })
// }
