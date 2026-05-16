import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.VITE_BASE_URL}/api/auth/google/callback`,
        },

        async (accessToken, refreshToken, profile, done) => {
            try {
                const existingUser = await User.findOne({
                    email: profile.emails[0].value,
                });

                if (existingUser) {
                    return done(null, existingUser);
                }

                const newUser = await User.create({
                    fullName: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    profilePic: profile.photos[0].value,
                    authType: "google",
                });

                return done(null, newUser);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});