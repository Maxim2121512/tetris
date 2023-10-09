/*
import Controller from "./controller";
import View from "./view";
import Model from "./model";
*/

import Controller from "/src/controller.js"
import View from "/src/view.js";
import Model from "/src/model.js";

const playfieldSize = {
    rows: 20,
    cols: 10
}
const defaultCellColor = "deepskyblue"
const playfield = document.getElementsByClassName("grid")[0];

const view = new View(playfield, playfieldSize, defaultCellColor);
const model = new Model(playfieldSize);
const controller = new Controller(view, model);

controller.startGame();
