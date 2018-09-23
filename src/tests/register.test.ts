import { request } from "graphql-request";
import { User } from "../entity/User";
import { createTypeORMConnection } from "../utils/createTypeORMConnection";
import { host } from "./constants";

const email = "user@test.com";
const password = "tester";
const mutation = `
  mutation {
    register(email: "${email}", password: "${password}")
  }
`;

beforeAll(async () => {
  await createTypeORMConnection();
});

test("Register user", async () => {
  const response = await request(host, mutation);
  expect(response).toEqual({ register: true });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);
});
