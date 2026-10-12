import { createNoteElement } from "./note.js";
import { initDrag } from "./drag.js";

const board = document.querySelector("#board");
const addButton = document.querySelector("#add-note");

const notes = new Map();

const colors = [
  "yellow",
  "pink",
  "blue",
  "green",
  "purple",
];

let editingContent = null;
let originalText = "";
let selectedNote = null;

// ВИБІР СТІКЕРА

const selectNote = (element) => {
  selectedNote?.classList.remove("note--selected");

  selectedNote = element;

  selectedNote?.classList.add("note--selected");
};

// ОБМЕЖЕННЯ КООРДИНАТ

const clampPosition = (x, y, width, height) => ({
  x: Math.max(
    0,
    Math.min(x, Math.max(0, board.clientWidth - width))
  ),

  y: Math.max(
    0,
    Math.min(y, Math.max(0, board.clientHeight - height))
  ),
});

// СТВОРЕННЯ СТІКЕРА

const createNote = (x = 30, y = 30) => {
  const id = crypto.randomUUID();

  const note = {
    id,
    text: "Нова нотатка",
    x: 0,
    y: 0,
    color: "yellow",
  };

  const element = createNoteElement(note);

  board.append(element);

  const position = clampPosition(
    x,
    y,
    element.offsetWidth,
    element.offsetHeight
  );

  const updatedNote = {
    ...note,
    ...position,
  };

  notes.set(id, updatedNote);

  element.style.left = `${updatedNote.x}px`;
  element.style.top = `${updatedNote.y}px`;

  selectNote(element);
};

// ЗАВЕРШЕННЯ РЕДАГУВАННЯ

const finishEditing = (save = true) => {
  if (!editingContent) return;

  const content = editingContent;

  const note = notes.get(
    content.closest(".note").dataset.id
  );

  const text = save
    ? content.textContent.trim()
    : originalText;

  if (note && save) {
    note.text = text;
  }

  content.textContent = text;
  content.contentEditable = "false";

  content.setAttribute("aria-readonly", "true");

  editingContent = null;
  originalText = "";
};

// ПОЧАТОК РЕДАГУВАННЯ

const startEditing = (content) => {
  if (editingContent === content) return;

  finishEditing();

  selectNote(content.closest(".note"));

  editingContent = content;
  originalText = content.textContent;

  content.contentEditable = "true";

  content.setAttribute("aria-readonly", "false");

  content.focus();

  const range = document.createRange();

  range.selectNodeContents(content);
  range.collapse(false);

  const selection = window.getSelection();

  selection.removeAllRanges();
  selection.addRange(range);
};

// ВИДАЛЕННЯ СТІКЕРА

const deleteNote = (element) => {
  if (!element) return;

  if (
    editingContent &&
    element.contains(editingContent)
  ) {
    finishEditing(false);
  }

  notes.delete(element.dataset.id);

  if (selectedNote === element) {
    selectedNote = null;
  }

 element.classList.add("note--removing");

  const removeElement = () => {
    element.remove();
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    removeElement();
  } else {
    element.addEventListener("transitionend", removeElement, {
      once: true,
    });

    setTimeout(removeElement, 300);
  }
};

// ЗМІНА КОЛЬОРУ

const changeColor = (element) => {
  const note = notes.get(element.dataset.id);

  if (!note) return;

  const hasCurrentColor = colors.some(
    (color) => color === note.color
  );

  if (!hasCurrentColor) {
    note.color = colors[0];
  }

  const nextIndex =
    (colors.indexOf(note.color) + 1) % colors.length;

  note.color = colors[nextIndex];

  element.dataset.color = note.color;
};

// ДОДАВАННЯ КНОПКОЮ

addButton.addEventListener("click", () => {
  finishEditing();

  const offset = (notes.size % 10) * 20;

  createNote(30 + offset, 30 + offset);
});

// ДОДАВАННЯ ПОДВІЙНИМ КЛІКОМ

board.addEventListener("dblclick", (event) => {
  if (event.target !== board) return;

  finishEditing();

  const rect = board.getBoundingClientRect();

  createNote(
    event.clientX - rect.left - board.clientLeft,
    event.clientY - rect.top - board.clientTop
  );
});

// ДЕЛЕГУВАННЯ ПОДІЙ

board.addEventListener("click", (event) => {
  const deleteButton = event.target.closest(
    ".note__delete"
  );

  if (deleteButton) {
    deleteNote(deleteButton.closest(".note"));
    return;
  }

  const colorButton = event.target.closest(
    ".note__color"
  );

  if (colorButton) {
    finishEditing();

    const element = colorButton.closest(".note");

    selectNote(element);
    changeColor(element);

    return;
  }

  const content = event.target.closest(
    ".note__content"
  );

  if (content) {
    startEditing(content);
    return;
  }

  const noteElement = event.target.closest(".note");

  if (noteElement) {
    finishEditing();
    selectNote(noteElement);
  } else {
    finishEditing();
    selectNote(null);
  }
});

// КЛІК ПОЗА СТІКЕРОМ

document.addEventListener("pointerdown", (event) => {
  if (
    editingContent &&
    !editingContent.closest(".note").contains(event.target)
  ) {
    finishEditing();
  }

  if (
    !board.contains(event.target) &&
    event.target !== addButton
  ) {
    selectNote(null);
  }
});

// ВИБІР СТІКЕРА ЧЕРЕЗ TAB

board.addEventListener("focusin", (event) => {
  const noteElement = event.target.closest(".note");

  if (noteElement) {
    selectNote(noteElement);
  }
});


// РЕДАГУВАННЯ ЧЕРЕЗ КЛАВІАТУРУ

board.addEventListener("keydown", (event) => {
  if (
    event.target.matches(".note__content") &&
    !editingContent &&
    event.key === "Enter"
  ) {
    event.preventDefault();
    startEditing(event.target);
  }
});



// ESCAPE, CTRL + ENTER, DELETE

document.addEventListener("keydown", (event) => {
  if (editingContent) {
    if (event.key === "Escape") {
      event.preventDefault();
      finishEditing(false);
    } else if (
      event.key === "Enter" &&
      (event.ctrlKey || event.metaKey)
    ) {
      event.preventDefault();
      finishEditing();
    }

    return;
  }

  if (event.key !== "Delete" || !selectedNote) {
    return;
  }

  const target = event.target;

  if (
    target instanceof HTMLElement &&
    (
      target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
    )
  ) {
    return;
  }

  event.preventDefault();

  deleteNote(selectedNote);
});

// ПІДКЛЮЧЕННЯ ПЕРЕТЯГУВАННЯ

initDrag({
  board,
  notes,
  onSelect: selectNote,
  onBeforeDrag: () => finishEditing(),
});

// АДАПТАЦІЯ ПРИ ЗМІНІ РОЗМІРУ ВІКНА

window.addEventListener("resize", () => {
  for (const element of board.querySelectorAll(".note")) {
    const note = notes.get(element.dataset.id);

    if (!note) continue;

    const position = clampPosition(
      note.x,
      note.y,
      element.offsetWidth,
      element.offsetHeight
    );

    Object.assign(note, position);

    element.style.left = `${note.x}px`;
    element.style.top = `${note.y}px`;
  }
});