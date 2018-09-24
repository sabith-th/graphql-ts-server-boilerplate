import { request } from "graphql-request";
import { AddressInfo } from "net";
import { User } from "../../entity/User";
import { startServer } from "../../startServer";
import {
  DUPLICATE_EMAIL_ERROR_MSG,
  INVALID_EMAIL_ERROR_MSG,
  PASSWORD_MIN_LENGTH_ERROR_MSG
} from "./errorMessages";

const mutation = (email: string, password: string) => `
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
  const email = "user@test.com";
  const password = "tester";
  const response = await request(getHost(), mutation(email, password));
  expect(response).toEqual({ register: null });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);
});

test("Registering user with same email should return an array with error message", async () => {
  const email = "user@test.com";
  const password = "tester";
  const response: any = await request(getHost(), mutation(email, password));
  expect(response.register).toHaveLength(1);
  expect(response.register[0].path).toEqual("email");
  expect(response.register[0].message).toEqual(DUPLICATE_EMAIL_ERROR_MSG);
});

test("Email should be proper and password should be atleast five characters", async () => {
  const email = "usertest.com";
  const password = "tes";
  const response: any = await request(getHost(), mutation(email, password));
  expect(response.register).toHaveLength(2);
  expect(response.register[0].path).toEqual("email");
  expect(response.register[0].message).toEqual(INVALID_EMAIL_ERROR_MSG);
  expect(response.register[1].path).toEqual("password");
  expect(response.register[1].message).toEqual(PASSWORD_MIN_LENGTH_ERROR_MSG);
});
