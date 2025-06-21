import AbsenceHistoryService from "../Services/absenceHistoryService.js";

class AbsenceHistoryController {
  async allHistory(req, res) {
    try {
      const result = await AbsenceHistoryService.getAllHistory();
      return res.status(result.status).json(result.body);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan server.",
        error: error.message,
      });
    }
  }

  async byAbsenceId(req, res) {
    try {
      const { id } = req.params;
      const result = await AbsenceHistoryService.getHistoryByAbsenceId(id);
      return res.status(result.status).json(result.body);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan server.",
        error: error.message,
      });
    }
  }

  async byStudentId(req, res) {
    try {
      const result = await AbsenceHistoryService.getHistoryByStudentId(
        req.user.id
      );
      return res.status(result.status).json(result.body);
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server.",
        error: error.message,
      });
    }
  }

  async byClassId(req, res) {
    try {
      const result = await AbsenceHistoryService.getHistoryByClassId(
        req.user.id,
        req.query
      );
      return res.status(result.status).json(result.body);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan server.",
        error: error.message,
      });
    }
  }

  async byClassIdTodayOnly(req, res) {
    try {
      const result = await AbsenceHistoryService.getTodayAbsencesByClass(
        req.user.id
      );
      return res.status(result.status).json(result.body);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan server.",
        error: error.message,
      });
    }
  }

  async editByClassIdTodayOnly(req, res) {
    try {
      const { id } = req.params;
      const { status, info } = req.body;
      const result = await AbsenceHistoryService.editTodayAbsenceStatus(
        req.user.id,
        id,
        status,
        info
      );
      return res.status(result.status).json(result.body);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan server.",
        error: error.message,
      });
    }
  }

  async onLoginStudent(req, res) {
    try {
      const result = await AbsenceHistoryService.studentTodayAttendance(
        req.user.id
      );
      return res.status(result.status).json(result.body);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan server.",
        error: error.message,
      });
    }
  }
}

export default new AbsenceHistoryController();
