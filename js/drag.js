export const initDrag = ({
  board,
  notes,
  onSelect,
  onBeforeDrag,
}) => {
  let drag = null;
  let highestZ = 1;

  const clamp = (value, max) => {
    return Math.max(
      0,
      Math.min(value, Math.max(0, max))
    );
  };

  // РУХ СТІКЕРА

  const move = (event) => {
    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }

    const rect = board.getBoundingClientRect();

    const {
      element,
      offsetX,
      offsetY,
    } = drag;

    const x = clamp(
      event.clientX - rect.left - board.clientLeft - offsetX,
      board.clientWidth - element.offsetWidth
    );

    const y = clamp(
      event.clientY - rect.top - board.clientTop - offsetY,
      board.clientHeight - element.offsetHeight
    );

    element.style.left = `${x}px`;
    element.style.top = `${y}px`;

    const note = notes.get(element.dataset.id);

    if (note) {
      Object.assign(note, { x, y });
    }
  };

  // ЗАВЕРШЕННЯ ПЕРЕТЯГУВАННЯ

  const stop = (event) => {
    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }

    const {
      element,
      header,
      pointerId,
    } = drag;

    element.classList.remove("note--dragging");

    if (header.hasPointerCapture(pointerId)) {
      header.releasePointerCapture(pointerId);
    }

    header.removeEventListener("pointermove", move);
    header.removeEventListener("pointerup", stop);
    header.removeEventListener("pointercancel", stop);

    drag = null;
  };

  // ПОЧАТОК ПЕРЕТЯГУВАННЯ

  board.addEventListener("pointerdown", (event) => {
    if (
      drag ||
      (event.pointerType === "mouse" && event.button !== 0)
    ) {
      return;
    }

    const header = event.target.closest(".note__header");

    if (!header || event.target.closest("button")) {
      return;
    }

    const element = header.closest(".note");

    if (!element) return;

    onBeforeDrag();
    onSelect(element);

    const rect = element.getBoundingClientRect();

    drag = {
      element,
      header,
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };

    element.style.zIndex = String(++highestZ);
    element.classList.add("note--dragging");

    header.setPointerCapture(event.pointerId);

    header.addEventListener("pointermove", move);
    header.addEventListener("pointerup", stop);
    header.addEventListener("pointercancel", stop);

    event.preventDefault();
  });
};