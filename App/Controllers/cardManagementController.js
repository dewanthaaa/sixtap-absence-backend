import CardManagementService from "../Services/cardManagementService.js";

class CardManagementController {
  async checkUserByNis(req, res) {
    const { nis } = req.body;
    const result = await CardManagementService.checkUserByNis(nis);
    return res.status(result.status).json(result.body);
  }

  async checkCardByUid(req, res) {
    const { card_uid } = req.body;
    const result = await CardManagementService.checkCardByUid(card_uid, req);
    return res.status(result.status).json(result.body);
  }

  async cardActivation(req, res) {
    const { nis, card_uid } = req.body;
    const result = await CardManagementService.cardActivation(nis, card_uid);
    return res.status(result.status).json(result.body);
  }

  async blockCard(req, res) {
    const { nis } = req.body;
    const result = await CardManagementService.blockCard(nis);
    return res.status(result.status).json(result.body);
  }

  async renewCard(req, res) {
    const { nis, card_uid } = req.body;
    const result = await CardManagementService.renewCard(nis, card_uid);
    return res.status(result.status).json(result.body);
  }
}

export default new CardManagementController();
