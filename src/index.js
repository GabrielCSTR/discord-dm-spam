const inquirer = require("inquirer");
const cliProgress = require('cli-progress');


const {
  getGuildTargets,
  getGuildChannels,
  getGuildChannelMembers,
  getDMTargets,
  sendMessageToUser,
} = require("./utils/discord.js");
const { saveUsers, askQuestions, loadConfig } = require("./utils/index.js");

let tokenUser = "";
const prompt = inquirer.createPromptModule();

async function startGuildSpam() {
  // Get all guilds
  const guilds = await getGuildTargets(tokenUser);

  if (!guilds) {
    console.log("Você não está em nenhuma guilda (server) no Discord.");
    return;
  }

  // Prompt guilds
  const guildChoices = guilds.map((guild) => ({
    name: guild.name,
    value: guild.id,
  }));

  // Prompt selected guild
  const guildResponse = await prompt([
    {
      type: "list",
      name: "selected_guild",
      message: "Select a guild (server):",
      choices: guildChoices,
    },
  ]);

  // Get selected guild
  const selectedGuild = guilds.find(
    (guild) => guild.id === guildResponse.selected_guild
  );
  if (!selectedGuild) {
    console.log("Você não está em nenhuma guilda (server) no Discord.");
    return;
  }
  console.log("\nGuild selected:", selectedGuild.name);

  // Get all channels from selected guild
  const selectedGuildChannelsChoices = await getGuildChannels(
    tokenUser,
    selectedGuild.id
  );
  let selectedGuildChannels = selectedGuildChannelsChoices.map((channel) => ({
    name: channel.name,
    value: channel.id,
    type: channel.type,
  }));

  // Filter only text channels
  selectedGuildChannels = selectedGuildChannels.filter(
    (channel) => channel.type === 0
  );
  // Prompt selected guild channel
  const guildChannelResponse = await prompt([
    {
      type: "list",
      loop: false,
      name: "selected_guild_channel",
      message: "Select a guild channel:",
      choices: selectedGuildChannels,
    },
  ]);

  // Get selected guild channel
  const selectedGuildChannel = selectedGuildChannelsChoices.find(
    (channel) => channel.id === guildChannelResponse.selected_guild_channel
  );
  console.log("\nSelected Guild Channel:", selectedGuildChannel.name);

  // Get all members from selected guild channel
  const guildMembersChoices = await getGuildChannelMembers(
    tokenUser,
    guildChannelResponse.selected_guild_channel
  );
  const guildMembers = guildMembersChoices.map((member) => ({
    name: member.author.username,
    id: member.author.id,
  }));

  // Remove duplicates from guild members list
  const uniqueMapMembers = new Map(
    guildMembers
      .filter((item) => item.name !== "Deleted User")
      .map((item) => [item.id, item])
  );
  const guildMembersUnique = Array.from(uniqueMapMembers.values());
  // console.log("\nGuild Channel Members:", guildMembersUnique);
  console.log("\nTotal Members: ", guildMembersUnique.length);

  // Save users
  await saveUsers(guildMembersUnique);
  console.log("Users saved in users.json 📄");

  // Get all messages from config.json
  const configData = await loadConfig();
  if (!configData) {
    console.log("No load data found in config.json. Please, check the file.");
  }
  console.log("Config data loaded from config.json 📄");

  // Parse messages from config.json
  const messages = configData.messages;

  // Prompt selected message
  const { selectedMessage } = await prompt([
    {
      type: "list",
      name: "selectedMessage",
      message: "Select a message to send:",
      choices: messages.map((msg) => ({ name: msg.title, value: msg.message })),
    },
  ]);

  // Initialize progress bar
  const progressBar = new cliProgress.SingleBar(
    {
      format:
        "Sending Messages: [{bar}] {percentage}% | {value}/{total} Members",
    },
    cliProgress.Presets.shades_classic
  );

  // Start progress bar
  progressBar.start(guildMembersUnique.length, 0);

  // Send the selected message to all members
  console.log("Messange selected:", selectedMessage);

  const membersIgnore = configData.ignore_users;
  console.log("Loading ignored members...");

  console.log("Sending messages to all members... 📩");

  const delay = 1000; // Delay de 1 segundo (1000ms) entre as mensagens

  if (membersIgnore) {
    for (let i = 0; i < guildMembersUnique.length; i++) {
      const member = guildMembersUnique[i];
      if (membersIgnore.includes(member.id)) {
        console.log("Ignoring member:", member.name);
      } else {
        console.log("Sending message to:", member.name);
        await sendMessageToUser(tokenUser, member.id, selectedMessage);
      }
      // Update progress bar
      progressBar.update(i + 1);

      // Delay antes de enviar a próxima mensagem
      await sleep(delay);
    }
  } else {
    for (let i = 0; i < guildMembersUnique.length; i++) {
      const member = guildMembersUnique[i];
      console.log("Sending message to:", member.name);
      await sendMessageToUser(tokenUser, member.id, selectedMessage);
      // Update progress bar
      progressBar.update(i + 1);

      // Delay antes de enviar a próxima mensagem
      await sleep(delay);
    }
  }

  // await sendMessageToUser(tokenUser, "1171438006952013935", selectedMessage);
  // guildMembersUnique.forEach((member) => {
  //   console.log('Sending message to:', member.name);
  // });

  // Stop progress bar
  progressBar.stop();

  console.log("Messages sent to all members.");
}

// Start DM Spam
async function startDMSpam() {
  const dms = await getDMTargets(tokenUser);
  console.log("dms:", dms);
}

async function main() {
  let output = "Hi, welcome to Node Discord DM Bot!";
  output += " \n";
  output += "     ____   ____  ___   ___  _____  ____  ____   \n";
  output += "    (  _ \\ (_  _)/ __) / __)(  _  )(  _ \\(  _ \\ \n";
  output += "     )(_) ) _)(_ \\__ \\( (__  )(_)(  )   / )(_) )\n";
  output += "    (____/ (____)(___/ \\___)(_____)(_)_) (____/ \n";
  output += "                   ____   __  __                    \n";
  output += "                  (  _ \\ (  \\/  )                   \n";
  output += "                   )(_) ) )    (                    \n";
  output += "                  (____/ (_/\\/\\_)                  \n";

  console.log(output);

  const questions = [
    {
      type: "input",
      name: "discord_token",
      message: "Inform you discord account token:\n",
      default:
        "See the video on how to get the discord token: https://www.youtube.com/watch?v=b2Y8-Z3Wtjo",
      validate(value) {
        const valid = value.length > 0;
        return valid || "Please enter a token.";
      },
      filter: String,
    },
    {
      type: "list",
      name: "message_type",
      message: "Select the type of message you want to send:",
      choices: [
        {
          key: "channel",
          name: "Channel Message",
          value: "channel",
        },
        {
          key: "dm",
          name: "DM Message",
          value: "dm",
        },
      ],
    },
  ];

  askQuestions(questions)
    .then(async (answers) => {
      // DISCORD TOKEN
      tokenUser = answers.discord_token;
      // MESSAGE TYPE
      const messageType = answers.message_type;

      try {
        switch (messageType) {
          case "dm":
            // Start DMS Spam
            await startDMSpam();
            break;
          case "channel":
            // Start Guild Spam
            await startGuildSpam();
            break;
          default:
            break;
        }
      } catch (error) {
        console.error(
          "Erro ao fazer a requisição à API do Discord:",
          error.message
        );
      }
    })
    .catch((err) => {
      console.error("Erro:", err);
    });
}

main();
