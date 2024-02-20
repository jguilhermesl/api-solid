import { FastifyInstance } from "fastify";

import { verifyJWT } from "@/http/middlewares/verify-jwt";
import { fetchGyms } from "./fetch-gyms";
import { fetchNearbyGyms } from "./fetch-nearby-gyms";
import { createGym } from "./create-gym";

export async function gymsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT);

  app.get('/gyms/search', fetchGyms)
  app.get('/gyms/nearby', fetchNearbyGyms)

  app.post('/gyms', createGym)
}