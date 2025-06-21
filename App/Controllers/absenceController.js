import AbsenceService from "../Services/absenceService.js";

class AbsenceController {
  async handleTapIn(req, res) {
    const { card_uid } = req.body;

    try {
      const result = await AbsenceService.processTapIn(card_uid, req);
      return res.status(result.status).json(result.body);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  }

  async handleTapOut(req, res) {
    const { card_uid } = req.body;

    try {
      const result = await AbsenceService.processTapOut(card_uid, req);
      return res.status(result.status).json(result.body);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  }
}

export default new AbsenceController();
