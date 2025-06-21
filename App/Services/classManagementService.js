import SchoolClass from "../Models/schoolclass.js";

const ClassManagementService = {
  async getAllClass(req, res) {
    const classes = await SchoolClass.findAll({
      attributes: ["id", "class_name", "class_code"],
      order: [["id", "ASC"]],
    });

    return {
      status: 200,
      body: {
        success: true,
        message: "Data kelas berhasil diambil",
        data: classes,
      },
    };
  },
};

export default ClassManagementService;
