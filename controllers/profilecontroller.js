import prisma from "../DB/db.config.js";
import { generateUniqueName, imageValidator } from "../utils/helper.js";

class ProfileController {
  static async index(req, res) {
    try {
      const user = req.user;
      return res.json({
        status: 200,
        user,
      });
    } catch (error) {
      return res.status(500).json({ message: "faat gya" });
    }
  }
  static async store() {}
  static async show() {}
  static async update(req, res) {
    try {
      const { id } = req.params;

      if (!req.files || Object.keys(req.files).length === 0) {
        return res
          .status(400)
          .json({ staus: 400, message: "Profile image is required" });
      }
      const profile = req.files.profile;
      const message = imageValidator(profile?.size, profile.mimetype);
      if (message !== null) {
        return res.status(400).json({
          error: {
            profile: message,
          },
        });
      }

      const imgExt = profile?.name.split(".");
      const imageName = generateUniqueName() + "." + imgExt[1];
      console.log(imageName);

      const uploadpath = process.cwd() + "/public/images/" + imageName;
      console.log(uploadpath);

      profile.mv(uploadpath, (err) => {
        if (err) {
          throw err;
        }
      });

      await prisma.users.update({
        data: {
          profile: imageName,
        },
        where: {
          id: Number(id),
        },
      });

      return res.json({
        status: 200,
        message: "Profile updated Successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "fattt gya" });
    }
  }
  static async destroy() {}
}

export default ProfileController;
