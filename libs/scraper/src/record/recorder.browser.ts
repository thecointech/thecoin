// NOTE: This executes client-side (in the browser)
export function onNewDocument() {

  __onAnyEvent({ type: "navigation", to: window.location.href, timestamp: Date.now(), id: crypto.randomUUID() });

  globalThis.__clickAction = "click";
  globalThis.__clickTypeFilter = undefined;

  // Disable console.clear
  console.clear = () => {};

  if (!globalThis.__eventsHooked) {
    const opts = {
      capture: true,
      passive: true
    };

    /////////////////////////////////////////////////////////////////////////

    window.addEventListener("load", () => {
      __onAnyEvent({
        type: 'load',
        timestamp: Date.now(),
        id: crypto.randomUUID()
      })
    });

    window.addEventListener("DOMContentLoaded", () => {
      __onAnyEvent({
        type: 'load',
        timestamp: Date.now(),
        id: crypto.randomUUID(),
      })
    });

    const getFilteredTarget = (ev: MouseEvent): HTMLElement|null => {
      //console.log(`GettingFiltered: ${(ev.target as any)?.nodeName}, id: ${(ev.target as any)?.id}, x: ${ev.pageX}, y: ${ev.pageY}`);

      if (ev.target instanceof HTMLElement) {
        if (!__clickTypeFilter) {
          return ev.target;
        }

        const typerex = new RegExp(__clickTypeFilter);
        // If we have a filter, does the default match?
        if (typerex.test(ev.target.nodeName)) {
          return ev.target;
        }
        const x = ev.pageX;
        const y = ev.pageY;
        const els = document.elementsFromPoint(x, y);
        for (const el of els) {
          if (typerex.test(el.nodeName)) {
            return el as HTMLElement;
          }
        }
      }
      return null;
    }

    // listen to clicks
    const clickEventListener = (ev: MouseEvent) => {
      const target = getFilteredTarget(ev);

      if (target) {
        // Get local copies of the data to ensure we don't care
        // about any changes that may be made during the click
        const data = window.getElementData(target);
        // This executes inside the page, so should _never_ happen
        if (!data) {
          throw new Error("Could not get element data");
        };

        const evt = {
          timestamp: Date.now(),
          id: crypto.randomUUID(),
          clickX: ev.pageX,
          clickY: ev.pageY,
          ...data
        }

        if (__clickAction == "dynamicInput") {
          // Allow any events to process before
          // we take over the execution of the click
          setTimeout(() => {
            __onAnyEvent({
              type: "dynamicInput",
              eventName: "--UNSET--",
              ...evt
            })
          }, 750);
        }
        else {
          // For click/value, send immediately
          __onAnyEvent({
            type: __clickAction,
            eventName: "clicked",
            ...evt
          });
        }

        // Take no action if reading value
        if (__clickAction == "value") {
          //console.log("Reading Value: " + target.innerText);
          ev.preventDefault();
          ev.stopImmediatePropagation();
        }
        __clickAction = "click";
        __clickTypeFilter = undefined;
      }
      else {
        // Do not capture clicks on unrelated elements
        //console.log("Skipping click");
        ev.preventDefault();
        ev.stopImmediatePropagation();
      }
    }
    window.addEventListener("click", clickEventListener, { capture: true });
    // Allow our hooks to supersede anything being applied by the page
    globalThis.__rehookEvents = () => {
      //console.log("Rehooking Events");
      window.removeEventListener("click", clickEventListener, { capture: true });
      window.addEventListener("click", clickEventListener, { capture: true });
    }

    // When leaving an input, capture it's value
    window.addEventListener("change", (ev) => {
      // Is this an input?
      const target = ev.target as HTMLInputElement;
      __onAnyEvent({
        type: "input",
        eventName: "valueChange",
        timestamp: Date.now(),
        id: crypto.randomUUID(),
        valueChange: true,
        value: target?.value,
        ...window.getElementData(target)!
      })
    }, opts);

    const enterEventListener = (ev: Event) => {
      if (ev instanceof KeyboardEvent) {
        // is this an enter key?
        if (ev.key == "Enter") {
          __onAnyEvent({
            type: "input",
            eventName: "hitEnter",
            timestamp: Date.now(),
            id: crypto.randomUUID(),
            hitEnter: true,
            value: (ev.target as HTMLInputElement)?.value,
            ...window.getElementData(ev.target as HTMLElement)!
          })
        }
        else {
          __onAnyEvent({
            type: "input",
            eventName: "keyDown",
            timestamp: Date.now(),
            id: crypto.randomUUID(),
            value: (ev.target as HTMLInputElement)?.value + ev.key,
            ...window.getElementData(ev.target as HTMLElement)!
          })
        }
      }
    }

    window.addEventListener('focusin', (ev) => {
      // Is this an input?
      //console.log("Focusin: ", ev.target);
      if (ev.target instanceof HTMLInputElement || ev.target instanceof HTMLTextAreaElement) {
        ev.target.addEventListener('keydown', enterEventListener, opts)
      }
    })
    window.addEventListener('focusout', ev => {
      //console.log("Focusout: ", ev.target);
      if (ev.target instanceof HTMLInputElement || ev.target instanceof HTMLTextAreaElement) {
        ev.target?.removeEventListener('keydown', enterEventListener)
      }
    })

    globalThis.__eventsHooked = true;
  }
}
