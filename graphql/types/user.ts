import { enumType, objectType } from "nexus";
import { Link } from "./link";

export const User = objectType({
  name: "User",
  definition(t) {
    t.string("id");
    t.string("name");
    t.string("email");
    t.string("image");
    t.field("role", { type: Role });
    t.list.field("bookmarks", {
      type: Link,
      async resolve(parent, arg, context) {
        return await context.prisma.user
          .findUnique({
            where: { id: parent?.id || "0" },
          })
          .bookmarks();
      },
    });
  },
});

const Role = enumType({
  name: "Role",
  members: ["USER", "ADMIN"],
});
