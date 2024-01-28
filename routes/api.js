import { Router } from "express";
import AuthController from "../controllers/Authcontroller.js";
import authMiddleware from "../middleware/authenticate.js";
import ProfileController from "../controllers/profilecontroller.js";
import NewsController from "../controllers/NewsController.js";
import redisCache from "../DB/redis.config.js";


const router= Router();

router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);

router.get("/send-email",AuthController.sendTest)


router.get("/profile",authMiddleware,ProfileController.index)

router.put("/profile/:id", authMiddleware,ProfileController.update)


//news routes

router.get('/news',redisCache.route(), NewsController.index)
router.post('/news', authMiddleware,NewsController.store)
router.get('/news/:id', NewsController.show)
router.put('/news/:id',authMiddleware, NewsController.update)
router.delete('/news/:id',authMiddleware, NewsController.destory)



export default router;