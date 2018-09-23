import { importSchema } from "graphql-import";
import { GraphQLServer } from "graphql-yoga";
import * as path from "path";
import "reflect-metadata";
import { resolvers } from "./resolvers";
import { createTypeORMConnection } from "./utils/createTypeORMConnection";

const startServer = async () => {
  const typeDefs = importSchema(path.join(__dirname, "schema.graphql"));
  const server = new GraphQLServer({ typeDefs, resolvers });
  await createTypeORMConnection();
  await server.start();
  console.log("Server running on localhost:4000");
};

startServer();
