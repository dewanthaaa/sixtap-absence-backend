import User from "../Models/user.js";
import Role from "../Models/role.js";
import SchoolClass from "../Models/schoolclass.js";
import RfidCard from "../Models/rfidcard.js";
import Wallet from "../Models/wallet.js";
import { sequelize } from "../Config/Database.js";

const CardManagementService = {
  async checkUserByNis(nis) {
    if (!nis || isNaN(Number(nis))) {
      return {
        status: 422,
        body: {
          message: "Validasi gagal.",
          errors: { nis: "NIS wajib diisi dan harus angka." },
        },
      };
    }

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
      return { status: 404, body: { message: "Pengguna tidak ditemukan." } };
    }

    const latestWallet = await Wallet.findOne({
      where: { user_id: user.id },
      order: [["created_at", "ASC"]],
    });

    return {
      status: 200,
      body: {
        message: "Data pengguna ditemukan.",
        data: { ...user.toJSON(), wallet: latestWallet },
      },
    };
  },

  async checkCardByUid(card_uid, req) {
    if (!card_uid || typeof card_uid !== "string") {
      return {
        status: 422,
        body: {
          message: "Validasi gagal.",
          errors: { card_uid: "UID kartu wajib diisi." },
        },
      };
    }

    const card = await RfidCard.findOne({
      where: { card_uid },
      include: [
        { model: User, as: "user" },
        { model: Wallet, as: "wallet" },
      ],
    });

    if (!card) {
      return { status: 404, body: { message: "Kartu tidak ditemukan." } };
    }

    const photoFilename = card.user?.photo_filename || null;
    const photoUrl = photoFilename
      ? `${req.protocol}://${req.get("host")}/uploads/photos/${photoFilename}`
      : null;

    return {
      status: 200,
      body: {
        message: "Data kartu ditemukan.",
        data: { ...card.toJSON(), photoUrl: photoUrl || null },
      },
    };
  },

  async cardActivation(nis, card_uid) {
    const t = await sequelize.transaction();
    try {
      const user = await User.findOne({ where: { nis } }, { transaction: t });
      if (!user) {
        await t.rollback();
        return { status: 404, body: { message: "Pengguna tidak ditemukan." } };
      }

      const cardExists = await RfidCard.findOne(
        { where: { card_uid } },
        { transaction: t }
      );
      if (cardExists) {
        await t.rollback();
        return {
          status: 409,
          body: { message: "Kartu RFID ini sudah terdaftar." },
        };
      }

      const activeCard = await RfidCard.findOne(
        {
          where: { user_id: user.id, is_active: true },
        },
        { transaction: t }
      );

      if (activeCard) {
        await t.rollback();
        return {
          status: 409,
          body: { message: "Pengguna sudah memiliki kartu aktif." },
        };
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

      return {
        status: 200,
        body: {
          message: "Kartu berhasil diaktivasi.",
          data: { user, card, wallet },
        },
      };
    } catch (error) {
      await t.rollback();
      return {
        status: 500,
        body: {
          message: "Terjadi kesalahan saat aktivasi kartu.",
          error: error.message,
        },
      };
    }
  },

  async blockCard(nis) {
    const t = await sequelize.transaction();
    try {
      const user = await User.findOne({ where: { nis } }, { transaction: t });
      if (!user) {
        await t.rollback();
        return { status: 404, body: { message: "Pengguna tidak ditemukan." } };
      }

      const card = await RfidCard.findOne({
        where: { user_id: user.id, is_active: true },
        transaction: t,
      });
      if (!card) {
        await t.rollback();
        return {
          status: 404,
          body: { message: "Pengguna tidak memiliki kartu aktif." },
        };
      }

      if (!card.is_active) {
        await t.rollback();
        return {
          status: 409,
          body: { message: "Kartu sudah diblokir sebelumnya." },
        };
      }

      await card.update(
        {
          is_active: false,
          blocked_at: new Date(),
        },
        { transaction: t }
      );

      await t.commit();

      return {
        status: 200,
        body: {
          message: "Kartu berhasil diblokir.",
          data: { user, card },
        },
      };
    } catch (error) {
      await t.rollback();
      return {
        status: 500,
        body: {
          message: "Terjadi kesalahan saat pemblokiran kartu.",
          error: error.message,
        },
      };
    }
  },

  async renewCard(nis, card_uid) {
    const t = await sequelize.transaction();
    try {
      const user = await User.findOne({ where: { nis } }, { transaction: t });
      if (!user) {
        await t.rollback();
        return { status: 404, body: { message: "Pengguna tidak ditemukan." } };
      }

      const existingCard = await RfidCard.findOne({
        where: { card_uid },
        transaction: t,
      });
      if (existingCard) {
        await t.rollback();
        return {
          status: 409,
          body: { message: "UID kartu sudah digunakan. Gunakan kartu lain." },
        };
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

      return {
        status: 200,
        body: {
          message: "Kartu berhasil diperbarui.",
          data: { user, old_card: oldCard, new_card: newCard, wallet },
        },
      };
    } catch (error) {
      await t.rollback();
      return {
        status: 500,
        body: {
          message: "Terjadi kesalahan saat perpanjangan kartu.",
          error: error.message,
        },
      };
    }
  },
};

export default CardManagementService;
