"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/use-cases/fetch-gyms.ts
var fetch_gyms_exports = {};
__export(fetch_gyms_exports, {
  FetchGymsUseCase: () => FetchGymsUseCase
});
module.exports = __toCommonJS(fetch_gyms_exports);
var FetchGymsUseCase = class {
  constructor(gymsRepository) {
    this.gymsRepository = gymsRepository;
  }
  async execute({ query, page }) {
    const gyms = await this.gymsRepository.findMany(query, page);
    return { gyms };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FetchGymsUseCase
});
