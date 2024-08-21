const inquirer = require('inquirer');
const fs = require("fs");

async function saveUsers(users) {
  fs.writeFileSync(
    "./src/data/users.json",
    JSON.stringify(users, null, 2),
    (err) => {
      if (err) {
        console.error("Erro ao salvar o arquivo:", err);
      } else {
        console.log("Respostas salvas em respostas.json");
      }
    }
  );
}

async function loadConfig(){
  try {
    const config = fs.readFileSync('./config.json', 'utf8');
    return JSON.parse(config);
  } catch (err) {
    console.error('Erro ao carregar o arquivo de configuração:', err);
    return {};
  }
}

async function askQuestions(questions) {
  const answers = {};
  const prompt = inquirer.createPromptModule();
  
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    try {
      const answer = await prompt(question);
      if (answer.retry) {
        i--; // Voltar para a pergunta anterior
        continue;
      }
      answers[question.name] = answer[question.name];
    } catch (err) {
      if (err.name === 'ExitPromptError') {
        console.log('\nLeaving...');
        process.exit(0);
      } else {
        throw err;
      }
    }
  }
  return answers;
}

module.exports = {
  saveUsers,
  askQuestions,
  loadConfig
};
