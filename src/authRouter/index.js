import express from "express";
import { generateJwt } from "../utils/auth/jwt.js";
import AuthorModel from "../authors/schema.js";
const authRouter = express.Router();
authRouter.post("/login", async (req, res, next) => {
  try {
    // findByCredentials() = a function in authors/schema.js which finds a user by email and compares the hashed value of password from request and the stored hashed value of the password.

    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error("Missing credentials.");
      error.status = 401;
      throw error;
    }

    const user = await AuthorModel.findByCredentials(email, password);
    if (!user) {
      const error = new Error("No such user.");
      error.status = 401;
      throw error;
    }
    const token = await generateJwt({ id: user._id }); //not real one, but ideally it would be real users id
    res.status(200).send({ token });
  } catch (error) {
    res.send("Sure buddy.");
    next(error);
  }
});

// create  author
authRouter.post("/register", async (req, res, next) => {
  try {
    const author = await new AuthorModel(req.body).save();
    const token = await generateJwt({ id: author._id });
    delete author._doc.password;

    res.send({ author, token });
  } catch (error) {
    console.log({ error });
    res.send(500).send({ message: error.message });
  }
});
export default authRouter;
