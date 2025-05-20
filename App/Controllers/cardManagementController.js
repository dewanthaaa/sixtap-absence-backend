import User from "../Models/user.js";
import Role from "../Models/role.js";
import SchoolClass from "../Models/schoolclass.js";
import RfidCard from "../Models/rfidcard.js";
import Wallet from "../Models/wallet.js";
import { sequelize } from "../Config/Database.js";
import { Op } from "sequelize";

class CardManagementController {
  async checkUserByNis(req, res) {
    const { nis } = req.body;
    if (!nis || isNaN(Number(nis))) {
      return res.status(422).json({
        message: "Validasi gagal.",
        errors: { nis: "NIS wajib diisi dan harus angka." },
      });
    }

    try {
      const user = await User.findOne({
        where: { nis },
        include: [
          { model: Role, as: "role" },
          { model: SchoolClass, as: "schoolClass" },
          { model: RfidCard, as: "rfidCard" },
          { model: Wallet, as: "wallet" },
        ],
      });
      if (!user) {
        return res.status(404).json({ message: "Pengguna tidak ditemukan." });
      }
      return res.json({
        message: "Data pengguna ditemukan.",
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan saat memeriksa pengguna.",
        error: error.message,
      });
    }
  }

  async checkCardByUid(req, res) {
    const { card_uid } = req.body;
    if (!card_uid || typeof card_uid !== "string") {
      return res.status(422).json({
        message: "Validasi gagal.",
        errors: { card_uid: "UID kartu wajib diisi." },
      });
    }

    try {
      const card = await RfidCard.findOne({
        where: { card_uid },
        include: ["user", "wallet"],
      });
      if (!card) {
        return res.status(404).json({ message: "Kartu tidak ditemukan." });
      }
      return res.json({
        message: "Data kartu ditemukan.",
        data: card,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan saat memeriksa kartu.",
        error: error.message,
      });
    }
  }

  async cardActivation(req, res) {
    const { nis, card_uid } = req.body;
    if (!nis || isNaN(Number(nis)) || !card_uid) {
      return res.status(422).json({
        message: "Validasi gagal.",
        errors: {
          nis:
            !nis || isNaN(Number(nis))
              ? "NIS wajib diisi dan harus angka."
              : undefined,
          card_uid: !card_uid ? "UID kartu wajib diisi." : undefined,
        },
      });
    }

    const t = await sequelize.transaction();
    try {
      const user = await User.findOne({ where: { nis } }, { transaction: t });
      if (!user) {
        await t.rollback();
        return res.status(404).json({ message: "Pengguna tidak ditemukan." });
      }

      const cardExists = await RfidCard.findOne(
        { where: { card_uid } },
        { transaction: t }
      );
      if (cardExists) {
        await t.rollback();
        return res
          .status(409)
          .json({ message: "Kartu RFID ini sudah terdaftar." });
      }

      const activeCard = await RfidCard.findOne(
        {
          where: { user_id: user.id, is_active: true },
        },
        { transaction: t }
      );
      if (activeCard) {
        await t.rollback();
        return res
          .status(409)
          .json({ message: "Pengguna sudah memiliki kartu aktif." });
      }

      const card = await RfidCard.create(
        {
          user_id: user.id,
          card_uid,
          is_active: true,
          activated_at: new Date(),
          blocked_at: null,
        },
        { transaction: t }
      );

      const wallet = await Wallet.create(
        {
          user_id: user.id,
          rfid_card_id: card.id,
          last_top_up: null,
          balance: 0,
        },
        { transaction: t }
      );

      await t.commit();

      return res.json({
        message: "Kartu berhasil diaktivasi.",
        data: { user, card, wallet },
      });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({
        message: "Terjadi kesalahan saat aktivasi kartu.",
        error: error.message,
      });
    }
  }

  async blockCard(req, res) {
    const { nis } = req.body;
    if (!nis || isNaN(Number(nis))) {
      return res.status(422).json({
        message: "Validasi gagal.",
        errors: { nis: "NIS wajib diisi dan harus angka." },
      });
    }

    const t = await sequelize.transaction();
    try {
      const user = await User.findOne({ where: { nis } }, { transaction: t });
      if (!user) {
        await t.rollback();
        return res.status(404).json({ message: "Pengguna tidak ditemukan." });
      }

      const card = await RfidCard.findOne({
        where: { user_id: user.id, is_active: true },
        transaction: t,
      });
      if (!card) {
        await t.rollback();
        return res
          .status(404)
          .json({ message: "Pengguna tidak memiliki kartu aktif." });
      }

      if (!card.is_active) {
        await t.rollback();
        return res
          .status(409)
          .json({ message: "Kartu sudah diblokir sebelumnya." });
      }

      await card.update(
        {
          is_active: false,
          blocked_at: new Date(),
        },
        { transaction: t }
      );

      await t.commit();

      return res.json({
        message: "Kartu berhasil diblokir.",
        data: { user, card },
      });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({
        message: "Terjadi kesalahan saat pemblokiran kartu.",
        error: error.message,
      });
    }
  }

  async renewCard(req, res) {
    const { nis, card_uid } = req.body;
    if (!nis || isNaN(Number(nis)) || !card_uid) {
      return res.status(422).json({
        message: "Validasi gagal.",
        errors: {
          nis:
            !nis || isNaN(Number(nis))
              ? "NIS wajib diisi dan harus angka."
              : undefined,
          card_uid: !card_uid ? "UID kartu wajib diisi." : undefined,
        },
      });
    }

    const t = await sequelize.transaction();

    try {
      const user = await User.findOne({ where: { nis } }, { transaction: t });
      if (!user) {
        await t.rollback();
        return res.status(404).json({ message: "Pengguna tidak ditemukan." });
      }

      const oldCard = await RfidCard.findOne(
        {
          where: { user_id: user.id, is_active: true },
        },
        { transaction: t }
      );

      if (oldCard) {
        await oldCard.update(
          { is_active: false, blocked_at: new Date() },
          { transaction: t }
        );
      }

      const newCard = await RfidCard.create(
        {
          user_id: user.id,
          card_uid,
          is_active: true,
          activated_at: new Date(),
          blocked_at: null,
        },
        { transaction: t }
      );

      let wallet = await Wallet.findOne(
        { where: { user_id: user.id } },
        { transaction: t }
      );
      if (wallet) {
        await wallet.update({ rfid_card_id: newCard.id }, { transaction: t });
      } else {
        wallet = await Wallet.create(
          {
            user_id: user.id,
            rfid_card_id: newCard.id,
            last_top_up: null,
            balance: 0,
          },
          { transaction: t }
        );
      }

      await t.commit();

      return res.json({
        message: "Kartu berhasil diperbarui.",
        data: { user, old_card: oldCard, new_card: newCard, wallet },
      });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({
        message: "Terjadi kesalahan saat perpanjangan kartu.",
        error: error.message,
      });
    }
  }
}

export default new CardManagementController();
