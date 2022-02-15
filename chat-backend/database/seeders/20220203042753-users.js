"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    await queryInterface.bulkInsert("Users", [
      {
        firstName: "Dena",
        lastName: "Eka",
        email: "dena_2208@yahoo.com",
        password: bcrypt.hashSync("123123", 12),
        gender: "male",
      },
      {
        firstName: "Jieun",
        lastName: "Jieun",
        email: "dena_2208@ymail.com",
        password: bcrypt.hashSync("123123", 12),
        gender: "female",
      },
      {
        firstName: "Karina",
        lastName: "Winter",
        email: "dena_2208@yaho.com",
        password: bcrypt.hashSync("123123", 12),
        gender: "female",
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete("Users", null, {});
  },
};
