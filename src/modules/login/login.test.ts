import { request } from "graphql-request";
import { User } from "../../entity/User";
import { createTypeORMConnection } from "../../utils/createTypeORMConnection";
import { CONFIRM_EMAIL_MSG, INVALID_LOGIN_MSG } from "./errorMessages";

const registerMutation = (email: string, password: string) => `
  mutation {
    register(email: "${email}", password: "${password}") {
      path
      message
    }
  }
`;

const loginMutation = (email: string, password: string) => `
  mutation {
    login(email: "${email}", password: "${password}") {
      path
      message
    }
  }
`;

beforeAll(async () => {
  createTypeORMConnection();
});

const loginExpectError = async (
  email: string,
  password: string,
  errorMessage: string
) => {
  const response = await request(
    process.env.TEST_HOST as string,
    loginMutation(email, password)
  );
  expect(response).toEqual({
    login: [
      {
        path: "email",
        message: errorMessage
      }
    ]
  });
};

describe("Login resolver tests", async () => {
  test("bad email should return error response", async () => {
    const email = "invalid@user.com";
    const password = "tester";
    await loginExpectError(email, password, INVALID_LOGIN_MSG);
  });

  test("bad password should return error response", async () => {
    const email = "valid@user.com";
    const password = "tester";
    const invalidPassword = "notTester";
    const registerResponse = await request(
      process.env.TEST_HOST as string,
      registerMutation(email, password)
    );
    expect(registerResponse).toEqual({ register: null });
    await loginExpectError(email, invalidPassword, INVALID_LOGIN_MSG);
  });

  test("not confirmed users should get not confirmed message", async () => {
    const email = "valid@user.com";
    const password = "tester";
    await loginExpectError(email, password, CONFIRM_EMAIL_MSG);
  });

  test("confirmed users should get null response", async () => {
    const email = "valid@user.com";
    const password = "tester";
    await User.update({ email }, { confirmed: true });
    const response = await request(
      process.env.TEST_HOST as string,
      loginMutation(email, password)
    );
    expect(response).toEqual({ login: null });
  });
});
