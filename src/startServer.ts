import * as connectRedis from "connect-redis";
import "dotenv/config";
import * as session from "express-session";
import { GraphQLServer } from "graphql-yoga";
import "reflect-metadata";
import { REDIS_SESSION_PREFIX } from "./constants";
import { redis } from "./redis";
import { confirmEmail } from "./routes/confirmEmail";
import { createTypeORMConnection } from "./utils/createTypeORMConnection";
import { genSchema } from "./utils/genSchema";

const SESSION_SECRET = "hellothere";
const RedisStore = connectRedis(session);

export const startServer = async () => {
  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request }) => ({
      redis,
      url: request.protocol + "://" + request.get("host"),
      session: request.session,
      req: request
    })
  });

  server.express.use(
    session({
      name: "qid",
      store: new RedisStore({
        client: redis as any,
        prefix: REDIS_SESSION_PREFIX
      }),
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7
      }
    })
  );

  const cors = {
    credentials: true,
    origin:
      process.env.NODE_ENV === "test"
        ? "*"
        : (process.env.FRONTEND_HOST as string)
  };

  server.express.get("/confirm/:id", confirmEmail);

  await createTypeORMConnection();
  const app = await server.start({
    cors,
    port: process.env.NODE_ENV === "test" ? 0 : 4000
  });
  console.log("Server running on localhost:4000");
  return app;
};
