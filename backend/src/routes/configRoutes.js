import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import Config from "../models/Config.js";

const router = express.Router();

// Get public config
router.get("/", async (req, res) => {
  try {
    const config = await Config.findOne({ configName: "default" });
    if (!config) {
      const newConfig = new Config({ configName: "default" });
      await newConfig.save();
      return res.json({ config: newConfig });
    }
    res.json({ config });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update config (admin only)
router.patch("/", protect, authorize("admin"), async (req, res) => {
  try {
    const updates = req.body;

    let config = await Config.findOne({ configName: "default" });
    if (!config) {
      config = new Config({ configName: "default", ...updates });
    } else {
      Object.assign(config, updates);
    }

    await config.save();
    res.json({ message: "Config updated", config });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
