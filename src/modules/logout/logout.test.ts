import axios from "axios";
import { Connection } from "typeorm";
import { User } from "../../entity/User";
import { createTypeORMConnection } from "../../utils/createTypeORMConnection";

let userId: string;
let conn: Connection;
const email = "testuser@test.com";
const password = "password";

const loginMutation = (e: string, p: string) => `
  mutation {
    login(email: "${e}", password: "${p}") {
      path
      message
    }
  }
`;

const logutMutation = `
  mutation {
    logout
  }
`;

const meQuery = `
  {
    me {
      id
      email
    }
  }
`;

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
    await axios.post(
      process.env.TEST_HOST as string,
      { query: loginMutation(email, password) },
      { withCredentials: true }
    );
    const response = await axios.post(
      process.env.TEST_HOST as string,
      { query: meQuery },
      { withCredentials: true }
    );
    expect(response.data.data).toEqual({
      me: {
        id: userId,
        email
      }
    });
    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: logutMutation
      },
      {
        withCredentials: true
      }
    );
    const response2 = await axios.post(
      process.env.TEST_HOST as string,
      { query: meQuery },
      { withCredentials: true }
    );
    expect(response2.data.data.me).toBeNull();
  });
});
