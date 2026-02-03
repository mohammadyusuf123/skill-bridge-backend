import { Router } from "express";
import { auth } from "../../../lib/auth"; // your Better Auth instance
import { fromNodeHeaders } from "better-auth/node"; // convert Node headers to Browser Headers
const router = Router();
router.get("/", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    return res.json({ success: true, session });
  } catch (err) {
    return res.status(401).json({ success: false, error: "Not authenticated" });
  }
});

export const SeasonRoutes = router;