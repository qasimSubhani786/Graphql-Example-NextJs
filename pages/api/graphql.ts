import { ApolloServer } from "apollo-server-micro";
// import { typeDefs } from "../../graphql/schema";
import { schema } from "../../graphql/schema";
import { resolvers } from "../../graphql/resolvers";
import Cors from "micro-cors";
import { createContext } from "../../graphql/context";

const apolloServer = new ApolloServer({
  schema,
  context: createContext,
});
const cors = Cors();

const startServer = apolloServer.start();

export default cors(async function handler(req: any, res: any) {
  if (req.method == "OPTIONS") {
    res.end();
    return false;
  }

  await startServer;

  await apolloServer.createHandler({
    path: "/api/graphql",
  })(req, res);
});

export const config = {
  api: {
    bodyParser: false,
  },
};
