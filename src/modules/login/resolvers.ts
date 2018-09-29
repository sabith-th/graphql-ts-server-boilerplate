import * as bcrypt from "bcryptjs";
import { USER_SESSION_ID_PREFIX } from "../../constants";
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
    login: async (
      _,
      { email, password }: GQL.ILoginOnMutationArguments,
      { session, redis, req }
    ) => {
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

      session.userId = user.id;
      if (req.sessionID) {
        await redis.lpush(`${USER_SESSION_ID_PREFIX}${user.id}`, req.sessionID);
      }

      return null;
    }
  }
};
