import { Connection } from "typeorm";
import { User } from "../../entity/User";
import { createTypeORMConnection } from "../../utils/createTypeORMConnection";
import { TestClient } from "../../utils/TestClient";

let userId: string;
let conn: Connection;
const email = "testuser2@test.com";
const password = "password";

beforeAll(async () => {
  conn = await createTypeORMConnection();
  const user = await User.create({
    email,
    password,
    confirmed: true
  }).save();
  userId = user.id;
});

afterAll(async () => {
  await conn.close();
});

describe("logout resolver tests", () => {
  test("logout user from multiple sessions", async () => {
    const session1 = new TestClient(process.env.TEST_HOST as string);
    const session2 = new TestClient(process.env.TEST_HOST as string);
    await session1.login(email, password);
    await session2.login(email, password);
    expect(await session1.me()).toEqual(await session2.me());
    await session1.logout();
    expect(await session1.me()).toEqual(await session2.me());
  });

  test("login and logout current user in single session", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await client.login(email, password);
    const response = await client.me();
    expect(response.data).toEqual({
      me: {
        id: userId,
        email
      }
    });
    await client.logout();
    const response2 = await client.me();
    expect(response2.data.me).toBeNull();
  });
});
