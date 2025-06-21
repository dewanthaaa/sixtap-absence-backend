import RecapService from "../Services/recapService.js";

class RecapController {
  async allAbsenceRecap(req, res) {
    try {
      const { range } = req.query;
      const result = await RecapService.allAbsenceRecap(range);
      return res.status(result.status).json(result.body);
    } catch (error) {
      return res.status(500).json({
        message: "Gagal mendapatkan rekap absensi",
        error: error.message,
      });
    }
  }

  async classAbsenceRecap(req, res) {
    try {
      const { id } = req.params;
      const { range } = req.query;
      const result = await RecapService.classAbsenceRecap(id, range);
      return res.status(result.status).json(result.body);
    } catch (error) {
      return res.status(500).json({
        message: "Gagal mendapatkan rekap absensi berdasarkan kelas",
        error: error.message,
      });
    }
  }

  async recapAbsenceDetail(req, res) {
    try {
      const { id } = req.params;
      const { filter } = req.query;
      const result = await RecapService.recapAbsenceDetail(id, filter);
      return res.status(result.status).json(result.body);
    } catch (error) {
      return res.status(500).json({
        message: "Gagal mendapatkan detail rekap absensi",
        error: error.message,
      });
    }
  }
}

export default new RecapController();
