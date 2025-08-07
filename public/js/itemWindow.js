const dashboard = document.querySelector("table");

let lastOpenedMenu = null;

console.log(dashboard);

dashboard.addEventListener("click", (e) => {
  // console.log(e.target);
  const el = e.target.closest(".more");

  if (!el) return;

  // const
  const row = event.target.closest(".dashboard-table-row").dataset.id;

  const menu = document.querySelector(`#item_${row}`);

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
