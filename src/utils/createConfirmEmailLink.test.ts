import * as Redis from "ioredis";
import fetch from "node-fetch";
import { Connection } from "typeorm";
import { User } from "../entity/User";
import { createConfirmEmailLink } from "./createConfirmEmailLink";
import { createTypeORMConnection } from "./createTypeORMConnection";

let userId: string;
const redis = new Redis();

let conn: Connection;

beforeAll(async () => {
  conn = await createTypeORMConnection();
  const user = await User.create({
    email: "testuser@test.com",
    password: "password"
  }).save();
  userId = user.id;
});

afterAll(() => {
  conn.close();
});

describe("ConfirmEmailLink tests", async () => {
  test("createConfirmEmailLink should return url, get call should return ok and clear key in redis", async () => {
    const url = await createConfirmEmailLink(
      process.env.TEST_HOST as string,
      userId,
      redis
    );
    const response = await fetch(url);
    const text = await response.text();
    expect(text).toEqual("ok");
    const user = await User.findOne({ where: { id: userId } });
    expect((user as User).confirmed).toBeTruthy();
    const chunks = url.split("/");
    const key = chunks[chunks.length - 1];
    const value = await redis.get(key);
    expect(value).toBeNull();
  });
});
