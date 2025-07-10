import { Router } from "express";
import { userProfileController } from "@controllers/userProfileController";

const router = Router();

router.post("/profiles", userProfileController.createProfile);
router.get("/profiles/:id", userProfileController.getProfileById);
router.get(
  "/users/:userId/profiles",
  userProfileController.getProfilesByUserId
);
router.patch("/profiles/:id", userProfileController.updateProfile);
router.delete("/profiles/:id", userProfileController.deleteProfile);

export const userProfileRouter = router;
