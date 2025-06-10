import SchoolClass from "../Models/schoolclass.js";

class ClassManagementController {
  async allClass(req, res) {
    try {
      const classes = await SchoolClass.findAll({
        attributes: ["id", "class_name", "class_code"],
        order: [["id", "ASC"]],
      });

      return res.status(200).json({
        success: true,
        message: "Data kelas berhasil diambil",
        data: classes,
      });
    } catch (error) {
      console.error("Error dalam mengambil data kelas:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data kelas",
      });
    }
  }
}

export default new ClassManagementController();
