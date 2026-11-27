/**
 * Editable track title (double-click to rename).
 */

let userTitle = "";

try {
  userTitle = localStorage.getItem("viztitle") || "";
} catch (e) {
}

titleStr = userTitle || "UNTITLED TRACK";
$("ttl").textContent = titleStr;

$("ttl").ondblclick = () => {
  const e = $("ttl");
  e.contentEditable = "true";
  e.focus();
  getSelection().selectAllChildren(e);
};

const endTitle = (ok) => {
  const e = $("ttl");
  if (e.contentEditable !== "true") return;
  e.contentEditable = "false";
  if (ok) {
    const v = e.textContent.replace(/\s+/g, " ").trim().toUpperCase().slice(0, 40);
    userTitle = v;
    if (v) titleStr = v;
    try {
      localStorage.setItem("viztitle", v);
    } catch (x) {
    }
  }
  e.textContent = titleStr;
};

$("ttl").onblur = () => endTitle(true);

$("ttl").onkeydown = (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    $("ttl").blur();
  } else if (e.key === "Escape") {
    e.stopPropagation();
    endTitle(false);
  }
};
