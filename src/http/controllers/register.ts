import { prismaClient } from "@/services/prisma";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";


export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6)
  })

  const { name, email, password } = registerBodySchema.parse(request.body);

  await prismaClient.user.create({
    data: {
      name,
      email,
      passwordHash: password
    }
  })

  return reply.status(201).send()
}