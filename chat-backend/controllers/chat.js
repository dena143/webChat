const { Op } = require("sequelize");

const { User, Chat, ChatUser, Message, sequelize } = require("../models");
const config = require("../config/app");
const { appPort } = require("../config/app");

exports.index = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.id },
      include: [
        {
          model: Chat,
          include: [
            {
              model: User,
              where: {
                [Op.not]: {
                  id: req.user.id,
                },
              },
            },
            {
              model: Message,
              include: [
                {
                  model: User,
                },
              ],
              limit: 20,
              order: [["id", "DESC"]],
            },
          ],
        },
      ],
    });

    return res
      .status(200)
      .json({ message: "Success retrievied data", data: user.Chats });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { partnerId } = req.body;
    const t = await sequelize.transaction();

    const user = await User.findOne({
      where: {
        id: req.user.id,
      },
      include: [
        {
          model: Chat,
          where: {
            type: "dual",
          },
          include: [
            {
              model: ChatUser,
              where: {
                userId: partnerId,
              },
            },
          ],
        },
      ],
    });

    if (user)
      return res.status(403).json({
        status: "error",
        message: "Chat with this user already exists!",
      });

    const chat = await Chat.create({ type: "dual" }, { transaction: t });

    await ChatUser.bulkCreate(
      [
        {
          chatId: chat.dataValues.id,
          userId: req.user.id,
        },
        {
          chatId: chat.dataValues.id,
          userId: partnerId,
        },
      ],
      { transaction: t }
    );

    const chatId = chat.dataValues.id;

    await t.commit();

    // const newChat = await Chat.findOne({
    //   where: {
    //     id: chatId,
    //   },
    //   include: [
    //     {
    //       model: User,
    //       where: {
    //         [Op.not]: {
    //           id: req.user.id,
    //         },
    //       },
    //     },
    //     {
    //       model: Message,
    //     },
    //   ],
    // });

    const creator = await User.findOne({
      where: {
        id: req.user.id,
      },
    });

    const partner = await User.findOne({
      where: {
        id: partnerId,
      },
    });

    const forCreator = {
      id: chat.id,
      type: "dual",
      Users: [partner],
      Messages: [],
    };

    const forReceiver = {
      id: chat.id,
      type: "dual",
      Users: [creator],
      Messages: [],
    };

    return res.status(201).json([forCreator, forReceiver]);
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ message: error.message });
  }
};

exports.addUserToGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    let chat = await Chat.findOne({
      where: {
        id: chatId,
      },
      include: [
        {
          model: User,
        },
        {
          model: Message,
          include: [
            {
              model: User,
            },
          ],
          limit: 20,
          order: [["id", "DESC"]],
        },
      ],
    });
    chat.Messages.reverse();

    // check if already in the chat
    chat.Users.forEach((user) => {
      if (user.id === userId) {
        return res.status(403).json({ message: "User already in the chat!" });
      }
    });

    await ChatUser.create({ chatId, userId });

    const newChatter = await User.findOne({
      where: {
        id: userId,
      },
    });

    if (chat.dataValues.type === "dual") {
      // chat.dataValues.type === "group";
      // chat.save();

      await Chat.update(
        {
          type: "group",
        },
        {
          where: {
            id: chatId,
          },
        }
      );

      chat = await Chat.findOne({
        where: {
          id: chatId,
        },
        include: [
          {
            model: User,
          },
          {
            model: Message,
            include: [
              {
                model: User,
              },
            ],
            limit: 20,
            order: [["id", "DESC"]],
          },
        ],
      });
      chat.Messages.reverse();
    }
    console.log("ini chat", chat);
    return res.status(201).json({ chat, newChatter });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.messages = async (req, res) => {
  try {
    const limit = 10;
    const page = req.query.page || 1;
    const offset = page > 1 ? page * limit : 0;

    const messages = await Message.findAndCountAll({
      where: {
        chatId: req.query.id,
      },
      include: [
        {
          model: User,
        },
      ],
      limit,
      offset,
      order: [["id", "DESC"]],
    });

    const totalPages = Math.ceil(messages.count / limit);

    if (page > totalPages)
      return res.status(404).json({ data: { messages: [] } });
    console.log(messages.rows);

    const result = {
      message: "Success retrivied data",
      messages: messages.rows,
      pagination: {
        page,
        totalPages,
      },
    };
    return res.status(200).json({
      result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.imageUpload = (req, res) => {
  if (req.file) {
    return res.status(201).json({ url: req.file.filename });
  }

  return res.status(500).json({ message: "No image uploaded" });
};

exports.deleteChat = async (req, res) => {
  try {
    const { id } = req.params;

    const chat = await Chat.findOne({
      where: {
        id,
      },
      include: [
        {
          model: User,
        },
      ],
    });

    const notifyUsers = chat.Users.map((user) => user.id);

    await Chat.destroy({
      where: {
        id,
      },
    });

    return res.status(200).json({ status: "success", chatId: id, notifyUsers });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.leaveCurrentChat = async (req, res) => {
  try {
    const { chatId } = req.body;
    let chat = await Chat.findOne({
      where: { id: chatId },
      include: [
        {
          model: User,
        },
      ],
    });

    if (chat.Users.length === 2) {
      return res.status(403).json({ message: "You cannot leave this chat" });
    }
    if (chat.Users.length === 3) {
      // chat.type = "dual";
      // chat.save();

      await Chat.update(
        {
          type: "dual",
        },
        {
          where: {
            id: chatId,
          },
        }
      );

      chat = await Chat.findOne({
        where: { id: chatId },
        include: [
          {
            model: User,
          },
        ],
      });
    }

    await ChatUser.destroy({
      where: {
        chatId,
        userId: req.user.id,
      },
    });

    await Message.destroy({
      where: {
        chatId,
        fromUserId: req.user.id,
      },
    });

    const notifyUsers = chat.Users.map((user) => user.id);

    return res.status(201).json({
      chatId: chat.id,
      userId: req.user.id,
      currentUserId: req.user.id,
      notifyUsers,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
