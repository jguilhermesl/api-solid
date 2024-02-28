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

// src/repositories/in-memory/in-memory-gyms-repository.ts
var in_memory_gyms_repository_exports = {};
__export(in_memory_gyms_repository_exports, {
  InMemoryGymsRepository: () => InMemoryGymsRepository
});
module.exports = __toCommonJS(in_memory_gyms_repository_exports);

// src/utils/get-distance-between-coordinates.ts
function getDistanceBetweenCoordinates(from, to) {
  if (from.latitude === to.latitude && from.longitude === to.longitude) {
    return 0;
  }
  const fromRadian = Math.PI * from.latitude / 180;
  const toRadian = Math.PI * to.latitude / 180;
  const theta = from.longitude - to.longitude;
  const radTheta = Math.PI * theta / 180;
  let dist = Math.sin(fromRadian) * Math.sin(toRadian) + Math.cos(fromRadian) * Math.cos(toRadian) * Math.cos(radTheta);
  if (dist > 1) {
    dist = 1;
  }
  dist = Math.acos(dist);
  dist = dist * 180 / Math.PI;
  dist = dist * 60 * 1.1515;
  dist = dist * 1.609344;
  return dist;
}

// src/repositories/in-memory/in-memory-gyms-repository.ts
var import_node_crypto = require("crypto");
var import_library = require("@prisma/client/runtime/library");
var InMemoryGymsRepository = class {
  constructor() {
    this.items = [];
  }
  async create(data) {
    var _a;
    const gym = {
      id: (0, import_node_crypto.randomUUID)(),
      name: data.name,
      description: (_a = data.description) != null ? _a : null,
      phone: data.phone,
      latitude: new import_library.Decimal(data.latitude.toString()),
      longitude: new import_library.Decimal(data.longitude.toString())
    };
    this.items.push(gym);
    return gym;
  }
  async findById(id) {
    const gym = this.items.find((item) => item.id === id);
    if (!gym) {
      return null;
    }
    return gym;
  }
  async findMany(query, page) {
    let gyms;
    if (query) {
      gyms = this.items.filter((item) => item.name.includes(query)).slice((page - 1) * 20, page * 20);
      return gyms;
    }
    gyms = this.items.slice((page - 1) * 20, page * 20);
    return gyms;
  }
  async findManyNearby(params) {
    const gyms = this.items.filter((item) => {
      const distance = getDistanceBetweenCoordinates(
        { latitude: params.userLatitude, longitude: params.userLongitude },
        { latitude: item.latitude.toNumber(), longitude: item.longitude.toNumber() }
      );
      return distance < 10;
    });
    return gyms;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InMemoryGymsRepository
});
