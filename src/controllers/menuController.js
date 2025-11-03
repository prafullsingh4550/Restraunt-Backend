import MenuItem from "../models/MenuItem.js";
import Category from "../models/Category.js";

export const getMenu = async (req, res) => {
  try {
    const { veg } = req.query; // get ?veg=true / ?veg=false

    const filter = { available: true };

    // Apply veg filter only if specified
    if (veg === 'true') filter.veg = true;
    if (veg === 'false') filter.veg = false;

    const categories = await Category.find({});
    const items = await MenuItem.find(filter).populate("categoryId", "name");

    res.json({ categories, items });
  } catch (err) {
    console.error("Error fetching menu:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc Seed menu items via API (Admin-only)
 * @route POST /api/v1/admin/menu/seed
 * @access Private (admin)
 */
export const seedMenuItems = async (req, res) => {
  try {
    const items = req.body.items;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Expected an array of menu items in 'items' field" });
    }

    const results = [];
    for (const item of items) {
      const result = await MenuItem.safeCreate(item);
      results.push(result);
    }

    res.json({
      message: "✅ Menu seeding completed successfully",
      inserted: results.length,
      items: results.map((i) => i.name),
    });
  } catch (err) {
    console.error("Seed error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc Update an existing menu item
 * @route PATCH /api/v1/admin/menu/:id
 * @access Private (admin)
 */
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Avoid allowing duplicate names during updates
    if (updates.name) {
      const existing = await MenuItem.findOne({
        name: updates.name.toLowerCase().trim(),
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(400).json({ error: "Menu item with this name already exists" });
      }
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    res.json({
      message: `✅ Menu item '${updatedItem.name}' updated successfully`,
      item: updatedItem,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc Delete a menu item by ID
 * @route DELETE /api/v1/admin/menu/:id
 * @access Private (admin)
 */
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await MenuItem.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    res.json({
      message: `🗑️ Menu item '${deleted.name}' deleted successfully`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

