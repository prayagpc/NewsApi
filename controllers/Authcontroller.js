import prisma from "../DB/db.config.js";
import { loginSchema, registerSchema } from "../validations/authValidation.js";
import vine, { errors } from "@vinejs/vine";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../config/mailer.js";
import logger from "../config/logger.config.js";

class AuthController {
  static async register(req, res) {
    try {
      const body = req.body;
      const validator = vine.compile(registerSchema);
      const payload = await validator.validate(body);

      const findUser = await prisma.users.findUnique({
        where: {
          email: payload.email,
        },
      });
      if (findUser) {
        return res.status(400).json({
          status: 500,
          message: "Email already exist",
        });
      }

      const salt = bcrypt.genSaltSync(10);
      payload.password = bcrypt.hashSync(payload.password, salt);
      const user = await prisma.users.create({
        data: payload,
      });
      return res.json({
        status: 200,
        message: "User created successfully",
        user,
      });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        // return res.stauserror.messages;
        // console.log(error.messages)
        return res.status(400).json({ errors: error.messages });
      } else {
        return res.status(500).json({
          status: 500,
          message: "Something went Wrong",
        });
      }
    }
  }

  static async login(req, res) {
    try {
      const body = req.body;
      const validator = vine.compile(loginSchema);
      const payload = await validator.validate(body);

      const findUser = await prisma.users.findUnique({
        where: {
          email: payload.email,
        },
      });
      if (findUser) {
        if (!bcrypt.compareSync(payload.password, findUser.password)) {
          return res.status(400).json({
            email: "Invalid credentials",
          });
        }

        // issue token
        const payloadData = {
          id: findUser.id,
          email: findUser.email,
          profile: findUser.profile,
          name: findUser.name,
        };
        const token = jwt.sign(payloadData, process.env.JWT_SECRET, {
          expiresIn: "365d",
        });

        return res.json({
          message: "Logged IN",
          access_token: `Bearer ${token}`,
        });
      }
      return res.status(400).json({
        email: "NO user find with this email",
      });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ errors: error.messages });
      } else {
        return res.status(500).json({
          status: 500,
          message: "Something went Wrong",
        });
      }
    }
  }

  static async sendTest(req, res) {
    try {
      const { email } = req.query;

      const payload = {
        toemail: email,
        subject: "Testing",
        body: "<h1>i am backend master</h1>",
      };

      await sendEmail(payload.toemail, payload.subject, payload.body);
      return res.json({
        status: 200,
        message: "email semt succesfully",
      });
    } catch (error) {
      console.log(error);
      logger.error({ type: "email error", body: "error" });
      return res.status(500).json({ message: "fatt gya" });
    }
  }
}

export default AuthController;
