import * as fs from "fs";
// tslint:disable-next-line:no-implicit-dependencies
import { GraphQLSchema } from "graphql";
import { importSchema } from "graphql-import";
import { makeExecutableSchema, mergeSchemas } from "graphql-tools";
import { GraphQLServer } from "graphql-yoga";
import * as Redis from "ioredis";
import * as path from "path";
import { User } from "./entity/User";
import { createTypeORMConnection } from "./utils/createTypeORMConnection";

export const startServer = async () => {
  const schemas: GraphQLSchema[] = [];
  const folders = fs.readdirSync(path.join(__dirname, "modules"));
  folders.forEach(folder => {
    const { resolvers } = require(`./modules/${folder}/resolvers`);
    const typeDefs = importSchema(
      path.join(__dirname, `modules/${folder}/schema.graphql`)
    );
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
  });

  const redis = new Redis();
  const server = new GraphQLServer({
    schema: mergeSchemas({ schemas }),
    context: ({ request }) => ({
      redis,
      url: request.protocol + "://" + request.get("host")
    })
  });

  server.express.get("/confirm/:id", async (req, res) => {
    const { id } = req.params;
    const userId = await redis.get(id);
    if (userId) {
      await User.update({ id: userId }, { confirmed: true });
      res.send("ok");
    } else {
      res.send("invalid");
    }
  });

  await createTypeORMConnection();
  const app = await server.start({
    port: process.env.NODE_ENV === "test" ? 0 : 4000
  });
  console.log("Server running on localhost:4000");
  return app;
};
