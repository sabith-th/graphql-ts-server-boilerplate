import { Connection } from "typeorm";
import { User } from "../../entity/User";
import { createTypeORMConnection } from "../../utils/createTypeORMConnection";
import { TestClient } from "../../utils/TestClient";

let userId: string;
let conn: Connection;
const email = "testuser@test.com";
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
  test("login and logout current user", async () => {
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
