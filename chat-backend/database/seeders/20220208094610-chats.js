"use strict";

const { User, Chat, ChatUser, Message } = require("../../models");

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
    const users = await User.findAll({ limit: 2 });

    const chat = await Chat.create();

    await ChatUser.bulkCreate([
      {
        chatId: chat.id,
        userId: users[0].id,
      },
      {
        chatId: chat.id,
        userId: users[1].id,
      },
    ]);

    await Message.bulkCreate([
      {
        message: "Hai",
        chatId: chat.id,
        fromUserId: users[0].id,
      },
      {
        message: "Bagaimana Kabarnya?",
        chatId: chat.id,
        fromUserId: users[0].id,
      },
      {
        message: "Alhamdulillah baik",
        chatId: chat.id,
        fromUserId: users[1].id,
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
  },
};
