export const createNoteElement = (note) => {
  const { id, text, x, y, color } = note;

  const element = document.createElement("article");
  element.className = "note";
  element.tabIndex = 0;
  element.setAttribute("aria-label", "Стікер");
  element.dataset.id = id;
  element.dataset.color = color;
  element.style.left = `${x}px`;
  element.style.top = `${y}px`;

  const header = document.createElement("div");
  header.className = "note__header";

  const colorButton = document.createElement("button");
  colorButton.type = "button";
  colorButton.className = "note__color";
  colorButton.textContent = "🎨";
  colorButton.setAttribute("aria-label", "Змінити колір стікера");

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "note__delete";
  deleteButton.textContent = "×";
  deleteButton.setAttribute("aria-label", "Видалити стікер");

  const content = document.createElement("div");
  content.className = "note__content";
  content.textContent = text;
  content.tabIndex = 0;
  content.setAttribute("role", "textbox");
  content.setAttribute("aria-label", "Текст стікера");
  content.setAttribute("aria-multiline", "true");
  content.setAttribute("aria-readonly", "true");

  header.append(colorButton, deleteButton);
  element.append(header, content);

  return element;
};