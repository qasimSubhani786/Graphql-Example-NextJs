import { extendType, intArg, objectType, stringArg } from "nexus";
import { User } from "./user";
import { title } from "process";

export const Link = objectType({
  name: "Link",
  definition(t) {
    t.string("id");
    t.string("title");
    t.string("url");
    t.string("description");
    t.string("imageUrl");
    t.string("category");
    t.list.field("users", {
      type: User,
      async resolve(parent, arg, context) {
        return await context.prisma.link
          .findUnique({
            where: { id: parent?.id || "0" },
          })
          .users();
      },
    });
  },
});

export const Edge = objectType({
  name: "Edge",
  definition(t) {
    t.string("cursor");
    t.field("node", {
      type: Link,
    });
  },
});

export const PageInfo = objectType({
  name: "PageInfo",
  definition(t) {
    t.string("endCursor");
    t.boolean("hasNextPage");
  },
});

export const Response = objectType({
  name: "Reponse",
  definition(t) {
    t.field("pageInfo", { type: PageInfo });
    t.list.field("edges", {
      type: Edge,
    });
  },
});

export const LinksQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("getAllLinks", {
      type: Response,
      args: {
        first: intArg(),
        after: stringArg(),
      },
      async resolve(parent, arg, context) {
        let queryResult = null;

        if (arg.after) {
          queryResult = await context.prisma.link.findMany({
            take: arg?.first ?? 0,
            skip: 1,
            cursor: {
              id: arg.after,
            },
          });
        } else {
          queryResult = await context.prisma.link.findMany({
            take: arg.first ?? 0,
          });
        }

        if (queryResult?.length > 0) {
          const lastLinkInResult = queryResult[queryResult.length - 1];
          const myCursor = lastLinkInResult?.id;

          const secondaryQueryReslt = await context.prisma.link.findMany({
            take: arg?.first ?? 0,
            cursor: {
              id: myCursor,
            },
          });
          const result = {
            pageInfo: {
              endCursor: myCursor,
              hasNextPage: secondaryQueryReslt.length >= (arg?.first ?? 0),
            },
            edges: queryResult.map((link) => ({
              cursor: link.id,
              node: link,
            })),
          };
          return result;
        } else {
          return {
            edges: [],
            pageInfo: {
              endCursor: null,
              hasNextPage: null,
            },
          };
        }
      },
    });
  },
});
