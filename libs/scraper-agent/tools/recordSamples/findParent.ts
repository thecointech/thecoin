// Function to be injected into page context
const findAppropriateParent = (element: HTMLElement) => {

  const elementCoords = window.getCoords(element);
  let currentParent = element.parentElement;
  let bestParent = currentParent;

  while (currentParent) {
    const parentCoords = window.getCoords(currentParent);

    // Check if parent is not too tall compared to input
    if (parentCoords.height > elementCoords.height * 3) {
      break;
    }

    // Count number of inputs and buttons in this parent
    const inputsAndButtons = Array.from(
      currentParent.querySelectorAll('input, button, select')
    );

    // If parent contains exactly one input/button (our target element)
    if (inputsAndButtons.length === 1 && inputsAndButtons[0] === element) {
      bestParent = currentParent;
    }

    currentParent = currentParent.parentElement;
  }

  return bestParent;
};
