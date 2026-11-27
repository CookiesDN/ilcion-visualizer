/**
 * Main menu (PLAY / SETTINGS).
 */

const showMenu = () => $("mm").classList.remove("off");
const hideMenu = () => $("mm").classList.add("off");

$("mbp").onclick = () => {
  hideMenu();
  if (buf) {
    if (!src || pos() >= buf.duration - 0.05) start(0);
    ac.resume();
  } else {
    flash("IMPORT STEMS TO BEGIN");
    $("fi").click();
  }
};

$("mbs").onclick = () => {
  hideMenu();
  $("set").hidden = false;
};

$("mnb").onclick = showMenu;

$("smm").onclick = () => {
  $("set").hidden = true;
  showMenu();
};
