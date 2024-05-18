"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _InfoCard = require("./InfoCard");
Object.keys(_InfoCard).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _InfoCard[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _InfoCard[key];
    }
  });
});