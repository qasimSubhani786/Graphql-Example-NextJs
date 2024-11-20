import { Context } from "./context";

export const resolvers = {
  Query: {
    links: async (_parent: any, arg: any, context: Context) =>
      await context.prisma.link.findMany(),
  },
};
