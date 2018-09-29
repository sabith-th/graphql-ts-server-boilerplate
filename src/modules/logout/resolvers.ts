import { REDIS_SESSION_PREFIX, USER_SESSION_ID_PREFIX } from "../../constants";
import { ResolverMap } from "../../types/graphql-utils";

export const resolvers: ResolverMap = {
  Query: {
    dummy: () => "dummy"
  },
  Mutation: {
    logout: async (_, __, { session, redis }) => {
      const { userId } = session;
      if (userId) {
        const sessionIds = await redis.lrange(
          `${USER_SESSION_ID_PREFIX}${userId}`,
          0,
          -1
        );
        const promises = [];
        for (const sessionId of sessionIds) {
          promises.push(redis.del(`${REDIS_SESSION_PREFIX}${sessionId}`));
        }
        await Promise.all(promises);
        return true;
      }
      return false;
    }
  }
};
