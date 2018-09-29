import { ResolverMap } from "../../types/graphql-utils";

export const resolvers: ResolverMap = {
  Query: {
    dummy: () => "dummy"
  },
  Mutation: {
    logout: (_, __, { session }) =>
      new Promise(res =>
        session.destroy(e => {
          if (e) {
            console.log("Error in destorying session: ", e);
          }
          res(true);
        })
      )
  }
};
