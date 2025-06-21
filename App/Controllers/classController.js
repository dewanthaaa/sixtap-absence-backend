import ClassManagementService from "../Services/classManagementService.js";

class ClassManagementController {
  async allClass(req, res) {
    try {
      const result = await ClassManagementService.getAllClass();

      return res.status(result.status).json(result.body);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  }
}

export default new ClassManagementController();
