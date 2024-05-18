"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _brandingTheme = require("./brandingTheme");
Object.keys(_brandingTheme).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _brandingTheme[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _brandingTheme[key];
    }
  });
});
var _BrandingProvider = require("./BrandingProvider");
Object.keys(_BrandingProvider).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _BrandingProvider[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _BrandingProvider[key];
    }
  });
});