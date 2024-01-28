import prisma from "../DB/db.config.js";
import redisCache from "../DB/redis.config.js";
import logger from "../config/logger.config.js";
import newsApiTransform from "../transform/newsApiTransform.js";
import { imageValidator, removeImage, uploadImage } from "../utils/helper.js";
import { newsSchema } from "../validations/newsValidation.js";
import vine, { errors } from "@vinejs/vine";

class NewsController {
  static async index(req, res) {
    //pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    if (page <= 0) {
      page = 1;
    }
    if (limit <= 0 || limit > 1000) {
      limit = 10;
    }
    const skip = (page - 1) * limit;

    const news = await prisma.news.findMany({
      take: limit,
      skip: skip,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile: true,
          },
        },
      },
    });
    const newsTransform = news?.map((item) => newsApiTransform.transform(item));
    // console.log(newsTransform);
    const totalNews = await prisma.news.count();
    const totalPages = Math.ceil(totalNews / limit);
    return res.json({
      status: 200,
      news: newsTransform,
      metadata: {
        totalPages,
        currentpage: page,
        currentLimit: limit,
      },
    });
  }
  static async store(req, res) {
    try {
      const user = req.user;
      const body = req.body;
      const validator = vine.compile(newsSchema);
      const payload = await validator.validate(body);
      if (!req.files || Object.keys(req.files).length === 0) {
        return res
          .status(400)
          .json({ staus: 400, message: "image is required" });
      }
      const image = req.files?.image;
      const message = imageValidator(image?.size, image?.mimetype);
      if (message !== null) {
        return res.status(400).json({
          error: {
            profile: message,
          },
        });
      }
      const imageName = uploadImage(image);

      payload.image = imageName;
      payload.user_id = user.id;
      const news = await prisma.news.create({
        data: payload,
      });
      //remove cache
      redisCache.del("/api/news",(err)=>{
        if(err) throw err;
      })
      return res.json({
        status: 200,
        message: "news created succesfully",
      });
    } catch (error) {
      logger.error(error?.message);
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
  static async show(req, res) {
    try {
      const { id } = req.params;
      const news = await prisma.news.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profile: true,
            },
          },
        },
      });
      const transformNews = news ? newsApiTransform.transform(news) : null;
      return res.json({
        status: 200,
        news: transformNews,
      });
    } catch (error) {
      return res.status(500).json({ message: "fattt gya" });
    }
  }
  static async update(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      console.log(user);
      const body = req.body;
      const news = await prisma.news.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (user.id !== news.user_id) {
        return res.status(400).json({ message: "UnAtuhorized" });
      }
      const validator = vine.compile(newsSchema);

      const payload = await validator.validate(body);
      const image = req?.files?.image;
      if (image) {
        const message = imageValidator(image?.size, image?.mimetype);
        if (message !== null) {
          return res.status(400).json({
            errors: {
              image: message,
            },
          });
        }
        //upload new image
        const imageName = uploadImage(image);

        payload.image = imageName;

        //delete old image
        // console.log(news.image)
        removeImage(news.image);
      }
      await prisma.news.update({
        data: payload,
        where: {
          id: Number(id),
        },
      });
      return res.status(200).json({ message: "news updates succesfully" });
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
  static async destory(req, res) {
    try {
      
      const { id } = req.params;
      const user = req.user;
      const news = await prisma.news.findUnique({
        where: {
          id: Number(id),
        },
      });
      if(user.id!== news.user_id){
        return res.status(400).json({ message: "UnAtuhorized" });
      }
      removeImage(news.image);
      await prisma.news.delete({
        where:{
          id: Number(id)
        }
      })
      //remove cache
      redisCache.del("/api/news",(err)=>{
        if(err) throw err;
      })
      return res.status(200).json({ message: "news deleted succesfully" });
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
}

export default NewsController;
