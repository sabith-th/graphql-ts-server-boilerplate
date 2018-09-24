import { request } from "graphql-request";
import { AddressInfo } from "net";
import { User } from "../../entity/User";
import { startServer } from "../../startServer";

const email = "user@test.com";
const password = "tester";
const mutation = `
  mutation {
    register(email: "${email}", password: "${password}") {
      path
      message
    }
  }
`;

let getHost = () => "";

beforeAll(async () => {
  const app = await startServer();
  const { port } = app.address() as AddressInfo;
  getHost = () => `http://127.0.0.1:${port}`;
});

test("Register user on success should return null and add user to db", async () => {
  const response = await request(getHost(), mutation);
  expect(response).toEqual({ register: null });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);
});

test("Registering user with same email should return an array with error message", async () => {
  const response: any = await request(getHost(), mutation);
  expect(response.register).toHaveLength(1);
  expect(response.register[0].path).toEqual("email");
});
