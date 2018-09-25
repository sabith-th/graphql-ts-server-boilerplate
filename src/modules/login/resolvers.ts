import * as bcrypt from "bcryptjs";
import { User } from "../../entity/User";
import { ResolverMap } from "../../types/graphql-utils";
import { GQL } from "../../types/schema";
import { CONFIRM_EMAIL_MSG, INVALID_LOGIN_MSG } from "./errorMessages";

const invalidLoginErrorResponse = [
  {
    path: "email",
    message: INVALID_LOGIN_MSG
  }
];

export const resolvers: ResolverMap = {
  Query: {
    bye2: () => "hi"
  },
  Mutation: {
    login: async (_, { email, password }: GQL.ILoginOnMutationArguments) => {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return invalidLoginErrorResponse;
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return invalidLoginErrorResponse;
      }

      if (!user.confirmed) {
        return [
          {
            path: "email",
            message: CONFIRM_EMAIL_MSG
          }
        ];
      }

      return null;
    }
  }
};
