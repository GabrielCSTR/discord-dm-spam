const axios = require("axios");

const DISCORD_API_BASE_URL = "https://discord.com/api/v9";

async function getGuildTargets(token) {
  try {
    const response = await axios.get(
      `${DISCORD_API_BASE_URL}/users/@me/guilds`,
      {
        headers: {
          Authorization: `${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao obter guilds:", error.message);
    throw error;
  }
}

async function getUserDetails(token) {
  try {
    const response = await axios.get(`${DISCORD_API_BASE_URL}/users/@me`, {
      headers: {
        Authorization: `${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao obter detalhes do usuário:", error.message);
    throw error;
  }
}

async function getDMTargets(token) {
  try {
    const response = await axios.get(
      `${DISCORD_API_BASE_URL}/users/@me/channels`,
      {
        headers: {
          Authorization: `${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao obter detalhes do usuário:", error.message);
    throw error;
  }
}

async function getGuildChannelMembers(token, channelId) {
  try {
    const response = await axios.get(
      `${DISCORD_API_BASE_URL}/channels/${channelId}/messages?limit=100`,
      {
        headers: {
          Authorization: `${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao obter membros da guilda:", error.message);
    throw error;
  }
}

async function getGuildChannels(token, guildId) {
  try {
    const response = await axios.get(
      `${DISCORD_API_BASE_URL}/guilds/${guildId}/channels`,
      {
        headers: {
          Authorization: `${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao obter membros da guilda:", error.message);
    throw error;
  }
}

async function sendMessageToUser(token, userId, message) {
  try {
     // Criar um canal DM com o usuário
     const channelResponse = await axios.post(
      `${DISCORD_API_BASE_URL}/users/@me/channels`,
      {
        recipient_id: userId,
      },
      {
        headers: {
          Authorization: `${token}`, // Certifique-se de que o token seja o de um bot
        },
      }
    );

    // Pegar o channelId do canal DM criado
    const channelId = channelResponse.data.id;
    console.log("channelId", channelId);
    
    if (!channelId) return;

    // Enviar a mensagem para o canal DM criado
    await axios.post(
      `${DISCORD_API_BASE_URL}/channels/${channelId}/messages`,
      {
        content: message,
      },
      {
        headers: {
          Authorization: `${token}`, // Certifique-se de que o token seja o de um bot
        },
      }
    );

  } catch (error) {
    console.error("Erro ao enviar mensagem:", error.message);
    throw error;
  }
}

module.exports = {
  getGuildTargets,
  getGuildChannels,
  getGuildChannelMembers,
  getDMTargets,
  getUserDetails,
  sendMessageToUser,
};
