import Holidays from "../src/index.js";

function update() {
    let hd = new Holidays("US");

    console.log(hd.getHolidays(2024));
}

update();
