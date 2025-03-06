
export function getCoordsWithMargin(element: HTMLElement) {
  const box = element.getBoundingClientRect();
  // const styles = element.computedStyleMap();

  const tryGetValue = (_prop: string) => {
    //@ts-ignore `value` is not part of the spec, but it appears to always be there in px
    // const value = styles.get(prop)?.value;
    // if (value) {
    //   const r = parseInt(value, 10);
    //   if (!Number.isNaN(r)) {
    //     return r;
    //   }
    // }
    return 0;
  }

  const marginTop = tryGetValue("margin-top");
  const marginBottom = tryGetValue("margin-bottom");
  const marginLeft = tryGetValue("margin-left");
  const marginRight = tryGetValue("margin-right");
  // We want the height/width of the content, so ignore padding
  const height = box.height + (marginTop + marginBottom);
  const width = box.width + (marginLeft + marginRight);
  return {
    top: box.top + window.scrollY - marginTop,
    left: box.left + window.scrollX - marginLeft,
    centerY: box.top + window.scrollY + (height / 2),
    height,
    width,
  };
}

export function mapInputToParent(element: HTMLElement) {
  const elementCoords = window.getCoords(element);
  let bestParent = element;
  const maxWidth = window.innerWidth / 2;

  while (bestParent) {
    const nextParent = bestParent.parentElement;
    if (!nextParent) break;
    const nextCoords = window.getCoords(nextParent);

    // Check if parent is oversized compared to the input.  We try to include neighbouring labels, but don't
    // want to extend over to much of the page.
    if (nextCoords.height > elementCoords.height * 3 || nextCoords.width > maxWidth) {
      break;
    }

    // Break if the parent contains any other inputs
    const inputs = Array.from(
      nextParent.querySelectorAll('input, select, form')
    );
    if (inputs.length !== 1) {
      break;
    }
    bestParent = nextParent;
  }
  return bestParent;
}
