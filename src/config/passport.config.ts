import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import {
  findUserByEmail,
  findUserById,
  verifyUserPassword,
} from "../services/user.service";
import { User } from "../../generated/prisma";

const localStrategy = new LocalStrategy(
  { usernameField: "email" },
  async function (email, password, done) {
    try {
      const user = await findUserByEmail(email);

      if (!user) {
        return done(null, false, { message: "valid email" });
      }

      const verify = await verifyUserPassword(password, user.password);

      if (!verify) {
        done(null, false, { message: "valid password" });
        return;
      }

      done(null, user);
    } catch (err) {
      done(err);
    }
  }
);

passport.use(localStrategy);

passport.serializeUser((user, done) => {
  done(null, (user as User).id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await findUserById(id as number);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
