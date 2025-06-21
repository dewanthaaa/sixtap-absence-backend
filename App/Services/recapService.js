import { Op } from "sequelize";
import moment from "moment";
import Absence from "../Models/absence.js";
import User from "../Models/user.js";

const RecapService = {
  async allAbsenceRecap(range) {
    const dateFilter = {};
    const today = new Date();

    if (range === "bulan_ini") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      dateFilter.date = { [Op.between]: [start, end] };
    } else if (range === "6_bulan") {
      const sixMonthsAgo = new Date(
        today.getFullYear(),
        today.getMonth() - 5,
        1
      );
      dateFilter.date = { [Op.gte]: sixMonthsAgo };
    }

    try {
      const usersWithAbsence = await User.findAll({
        where: { role_id: 2 },
        include: [
          {
            model: Absence,
            as: "absences",
            where: Object.keys(dateFilter).length ? dateFilter : undefined,
            attributes: ["absence_status"],
          },
        ],
        order: [["name", "ASC"]],
      });

      if (!usersWithAbsence.length) {
        return {
          status: 404,
          body: {
            message: "Data rekap absensi tidak ditemukan.",
            data: [],
          },
        };
      }

      const recapData = usersWithAbsence.map((user, index) => {
        const absences = user.absences || [];
        return {
          no: index + 1,
          id: user.id,
          name: user.name,
          nis: user.nis,
          sum_attendance: absences.filter((a) => a.absence_status === "hadir")
            .length,
          sum_permission: absences.filter((a) => a.absence_status === "izin")
            .length,
          sum_sick: absences.filter((a) => a.absence_status === "sakit").length,
          sum_alpa: absences.filter((a) => a.absence_status === "alpa").length,
        };
      });

      return {
        status: 200,
        body: {
          message: "Berhasil mendapatkan rekap absensi",
          data: recapData,
        },
      };
    } catch (error) {
      return {
        status: 500,
        body: {
          message: "Gagal mendapatkan rekap absensi",
          error: error.message,
        },
      };
    }
  },

  async classAbsenceRecap(id, range) {
    if (!id) {
      return {
        status: 400,
        body: { message: "ID kelas wajib disertakan." },
      };
    }

    const dateFilter = {};
    const today = new Date();

    if (range === "bulan_ini") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      dateFilter.date = { [Op.between]: [start, end] };
    } else if (range === "6_bulan") {
      const sixMonthsAgo = new Date(
        today.getFullYear(),
        today.getMonth() - 5,
        1
      );
      dateFilter.date = { [Op.gte]: sixMonthsAgo };
    }

    try {
      const classWithAbsence = await User.findAll({
        where: { role_id: 2, schoolclass_id: id },
        include: [
          {
            model: Absence,
            as: "absences",
            where: Object.keys(dateFilter).length ? dateFilter : undefined,
            attributes: ["absence_status"],
          },
        ],
        order: [["name", "ASC"]],
      });

      if (!classWithAbsence.length) {
        return {
          status: 404,
          body: {
            message: "Tidak ditemukan siswa dengan absensi di kelas tersebut.",
            data: [],
          },
        };
      }

      const recapData = classWithAbsence.map((user, index) => {
        const absences = user.absences || [];
        return {
          no: index + 1,
          user_id: user.id,
          name: user.name,
          nis: user.nis,
          sum_attendance: absences.filter((a) => a.absence_status === "hadir")
            .length,
          sum_permission: absences.filter((a) => a.absence_status === "izin")
            .length,
          sum_sick: absences.filter((a) => a.absence_status === "sakit").length,
          sum_alpa: absences.filter((a) => a.absence_status === "alpa").length,
        };
      });

      return {
        status: 200,
        body: {
          message: "Berhasil mendapatkan rekap absensi berdasarkan kelas.",
          data: recapData,
        },
      };
    } catch (error) {
      return {
        status: 500,
        body: {
          message: "Gagal mendapatkan rekap absensi",
          error: error.message,
        },
      };
    }
  },

  async recapAbsenceDetail(id, filter) {
    if (!id) {
      return {
        status: 400,
        body: { message: "ID siswa wajib disertakan." },
      };
    }

    let startDate;
    const endDate = new Date();

    if (filter === "6-bulan") {
      startDate = moment().subtract(6, "months").startOf("month").toDate();
    } else {
      startDate = moment().startOf("month").toDate();
    }

    try {
      const userWithAbsence = await User.findOne({
        where: { id, role_id: 2 },
        include: [
          {
            model: Absence,
            as: "absences",
            where: { date: { [Op.between]: [startDate, endDate] } },
            required: false,
            attributes: ["absence_status", "date"],
          },
        ],
      });

      if (!userWithAbsence) {
        return {
          status: 404,
          body: {
            message:
              "Siswa tidak ditemukan atau tidak memiliki absensi pada periode tersebut.",
            data: null,
          },
        };
      }

      const absences = userWithAbsence.absences || [];
      const recap = {
        no: 1,
        user_id: userWithAbsence.id,
        name: userWithAbsence.name,
        nis: userWithAbsence.nis,
        sum_attendance: absences.filter((a) => a.absence_status === "hadir")
          .length,
        sum_permission: absences.filter((a) => a.absence_status === "izin")
          .length,
        sum_sick: absences.filter((a) => a.absence_status === "sakit").length,
        sum_alpa: absences.filter((a) => a.absence_status === "alpa").length,
        time_range: {
          dari: moment(startDate).format("YYYY-MM-DD"),
          sampai: moment(endDate).format("YYYY-MM-DD"),
        },
      };

      return {
        status: 200,
        body: {
          message: "Berhasil mendapatkan rekap absensi siswa.",
          data: recap,
        },
      };
    } catch (error) {
      return {
        status: 500,
        body: {
          message: "Gagal mendapatkan rekap absensi siswa",
          error: error.message,
        },
      };
    }
  },
};

export default RecapService;
