const dashboard = document.querySelector("table");

const body = document.querySelector("body");

let lastOpenedMenu = null;

body.addEventListener("click", () => {
  console.log(lastOpenedMenu);
  if (lastOpenedMenu) {
    lastOpenedMenu.classList.add("hidden");
    lastOpenedMenu = null;
  }
});

dashboard.addEventListener("click", (e) => {
  // console.log(e.target);
  const el = e.target.closest(".more");

  if (!el) return;

  // const
  const row = e.target.closest(".dashboard-table-row").dataset.id;

  const menu = document.querySelector(`#item_${row}`);

  e.stopPropagation();

  // const allOptions = document.querySelectorAll(".item-options");

  // allOptions.forEach(option => {
  //   option.classList.add("hidden")
  // })

  // if other menu is open - close it
  if (lastOpenedMenu && lastOpenedMenu !== menu) {
    lastOpenedMenu.classList.add("hidden");
  }

  menu.classList.toggle("hidden");

  // if menu is open now = remember it, if not - clear reafernece
  lastOpenedMenu = menu.classList.contains("hidden") ? null : menu;
});
