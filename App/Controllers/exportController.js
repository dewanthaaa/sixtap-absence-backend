import ExportService from "../Services/exportService.js";

class ExportController {
  async exportAllAbsenceRecapToExcel(req, res) {
    return ExportService.exportAllAbsenceRecap(req, res);
  }

  async exportClassAbsenceRecapToExcel(req, res) {
    return ExportService.exportClassAbsenceRecap(req, res);
  }
}

export default new ExportController();
