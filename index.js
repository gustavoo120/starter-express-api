const diacritics = require('diacritics');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const qrcode = require('qrcode-terminal');

const SESSION_FILE_PATH = 'session.json';
const ATENDIDOS_FILE_PATH = 'atendidos.json'; // Caminho para o arquivo que armazena usuários atendidos

let client;

// Carregar a lista de usuários atendidos se ela existir
let usuariosAtendidos = [];
if (fs.existsSync(ATENDIDOS_FILE_PATH)) {
  usuariosAtendidos = require(ATENDIDOS_FILE_PATH);
}

// Carregar a sessão se ela existir
const loadSession = () => {
  if (fs.existsSync(SESSION_FILE_PATH)) {
    const sessionData = require(SESSION_FILE_PATH);
    return sessionData;
  }
  return null;
};
// Função para limpar o arquivo de sessão
const clearSessionFile = () => {
  if (fs.existsSync(SESSION_FILE_PATH)) {
    fs.unlinkSync(SESSION_FILE_PATH);
    console.log('Arquivo de sessão limpo.');
  }
};

// Exemplo de uso
const session = loadSession();

if (!session) {
  console.log('Sessão não encontrada. Limpando o arquivo de sessão...');
  clearSessionFile();
  // Execute qualquer lógica adicional necessária para lidar com a ausência da sessão
} else {
  // A sessão foi encontrada, prossiga com a lógica normal
  console.log('Sessão encontrada:', session);
}

// Inicializar cliente com a estratégia LocalAuth
client = new Client({
  session: loadSession(),
  authStrategy: new LocalAuth({ clientId: 'client-one' }),
});

console.log('Iniciando, aguarde...');

// Este método nos avisa quando a conexão se realiza uma vez escaneado nosso QR em no terminal
client.on('ready', () => {
  console.log('Iiiiiihaaa, já to dentro chefe!');
});

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
  console.log('Escaneia o QR code pra eu desfrutar :)');
});

// Este método nos avisa quando ocorre uma falha na autenticação
client.on('auth_failure', msg => {
  console.error('Falha na autenticação:', msg);
});
function removerUsuarioAtendido(userId) {
 etiquetar(userId, "Em Atendimento", "remover");
  const index = usuariosAtendidos.indexOf(userId);
  if (index !== -1) {
    usuariosAtendidos.splice(index, 1);
    //fs.writeFileSync(ATENDIDOS_FILE_PATH, JSON.stringify(usuariosAtendidos));
    console.log(`Usuário ${userId} removido da lista de atendidos.`);
  }
}
function finalizarAtendimentoPorInatividade(userId) {
  // Responder ao usuário informando que o atendimento foi finalizado por inatividade
  client.sendMessage(userId, 'O atendimento foi finalizado devido à inatividade. Se precisar de mais ajuda, estou por aqui :)\nhttps://marcelowatch.com.br/');
	removerUsuarioAtendido(userId);
  // Remover o usuário da lista de atendimento
  //removerUsuarioAtendido(userId);
  delete opp[userId]?.opcoes;
  // Excluir o estado do usuário
  delete estadosUsuarios[userId];
}
function retornarInicio(userId){
	delete opp[userId]?.opcoes;
	delete estadosUsuarios[userId];
}
//função para adicionar etiquetas
function etiquetar(phoneNumber, label, oq) {
	/*/
    if (oq === "adicionar") {
        console.log("To aqui adicionando!");
        return client.addLabel(phoneNumber, label).then(() => {
            console.log('Etiqueta adicionada com sucesso para', phoneNumber);
            return true;  // Resolve a Promise com verdadeiro
        }).catch((error) => {
            console.error('Erro ao adicionar a etiqueta para', phoneNumber, ':', error);
            return false;  // Resolve a Promise com falso em caso de erro
        });
    } else if (oq === "remover") {
        console.log("To aqui removendo!");
        return client.removeLabel(phoneNumber, label).then(() => {
            console.log('Etiqueta removida com sucesso para', phoneNumber);
            return true;  // Resolve a Promise com verdadeiro
        }).catch((error) => {
            console.error('Erro ao remover a etiqueta para', phoneNumber, ':', error);
            return false;  // Resolve a Promise com falso em caso de erro
        });
    } else if (oq === "qual") {
        console.log("To aqui verificando!");
        // Retorna a Promise resultante de client.getLabels
        return client.getLabels(phoneNumber).then((labels) => {
            // Retorna verdadeiro se a etiqueta desejada estiver presente
            return labels.includes(label);
        }).catch((error) => {
            console.error('Erro ao verificar as etiquetas para', phoneNumber, ':', error);
            return false;  // Resolve a Promise com falso em caso de erro
        });
    }/*/
}

// Função para enviar a mensagem inicial
function enviarMensagemInicial(message, horaAtual, userId) {
delete opp[userId]?.opcoes;
  const opcoes = [
	  'Quero comprar!',
	  'Quero trocar meu produto!',
	  'Ajuda para manusear/configurar o produto!',
	  'Meu produto parou de funcionar!',
	  'Quero saber o andamento da minha devolução!',
	  'Assistência Técnica!',
	  'Devolução por arrependimento, 7 dias corridos!'
  ];
	 if (horaAtual >= 6 && horaAtual < 12) {
      saudacaoInicial = 'Bom dia! Como posso ajudar?';
    } else if (horaAtual >= 12 && horaAtual < 18) {
      saudacaoInicial = 'Boa tarde! Em que posso ajudar hoje?';
    } else {
      saudacaoInicial = 'Boa noite! Como posso ajudar?';
    }
  const opcoesTexto = opcoes.map((opcao, index) => `${index + 1}. ${opcao}`).join('\n');
  const mensagemInicial = `${saudacaoInicial}\n\nQual opção melhor se adequa ao seu problema? (digite apenas o número):\n${opcoesTexto}`;
  estadosUsuarios[userId] = 'inicial';
  message.reply(mensagemInicial);
  console.log("Mensagem inicial enviada: " + mensagemInicial);
}

// Objeto para rastrear o estado de cada usuário
const estadosUsuarios = {};
const opp = {};
let opcaoSelecionada;
const horarioAtendimentoInicio = 12;
const horarioAtendimentoFim = 17;
const temporizadoresInatividade = {};
client.on('message', message => {
  const corpoMensagem = diacritics.remove(message.body.toLowerCase());
  const horaAtual = new Date().getHours();
  
	// Verificar se há opções salvas para este usuário
	const opcoesSalvas = opp[message.from]?.opcoes;

	// Usar as opções salvas ou as opções padrão se não houver opções salvas
	opcoes = opcoesSalvas || [
	  'Quero comprar!',
	  'Quero trocar meu produto!',
	  'Ajuda para manusear/configurar o produto!',
	  'Meu produto parou de funcionar!',
	  'Quero saber o andamento da minha devolução!',
	  'Assistência Técnica!',
	  'Devolução por arrependimento, 7 dias corridos!'
	];
  
   let resposta;
   let opcaoSelecionada;

 // Resetar o temporizador de inatividade sempre que receber uma mensagem do usuário
  if (temporizadoresInatividade[message.from]) {
    clearTimeout(temporizadoresInatividade[message.from]);
  }

  // Configurar o novo temporizador de inatividade
  temporizadoresInatividade[message.from] = setTimeout(() => {
    finalizarAtendimentoPorInatividade(message.from);
  }, 7 * 60 * 60 * 1000); // 7 horas em milissegundos
  
  
  // Verificar se o usuário já foi atendido
  if (usuariosAtendidos.includes(message.from)) {
    console.log('Usuário '+message.from+' já atendido. Ignorando mensagem.');
    return;
  }
  //vou também verificar se ele já não foi eticatado, assim, não mando mensagens iniciais
  if(etiquetar(message.from, "Em Atendimento", "qual")==true){
	  //não faz nada, esse usuario já foi demarcado como em atendimento, de forma automática ou manual
	  return;
  }
  if (!estadosUsuarios[message.from]) {
    // Se o usuário não tem um estado registrado, é a primeira mensagem
    if (horaAtual >= 6 && horaAtual < 12) {
      resposta = 'Bom dia! Como posso ajudar?';
    } else if (horaAtual >= 12 && horaAtual < 18) {
      resposta = 'Boa tarde! Em que posso ajudar hoje?';
    } else {
      resposta = 'Boa noite! Como posso ajudar?';
    }

    // Adicionar as opções do primeiro menu à resposta
    const opcoesTexto = opcoes.map((opcao, index) => `${index + 1}. ${opcao}`).join('\n');
    resposta += `\n\nQual opção melhor se adequa ao seu problema? (digite apenas o número):\n${opcoesTexto}`;

    // Salvar o estado do usuário como 'inicial'
    estadosUsuarios[message.from] = 'inicial';
  } else {
    // O usuário já enviou uma mensagem, processar de acordo com o estado
    const estadoAtual = estadosUsuarios[message.from];

    switch (estadoAtual) {
      
	  
      case 'inicial':
	  
	  opcaoSelecionada = parseInt(corpoMensagem);
	  console.log('To aqui'+opcaoSelecionada);
        if (!isNaN(opcaoSelecionada) && opcaoSelecionada > 0 && opcaoSelecionada <= opcoes.length) {
			console.log('To dentro '+opcaoSelecionada);
          // Implemente a lógica para a opção selecionada
          resposta = `Você selecionou a opção ${opcaoSelecionada}: ${opcoes[opcaoSelecionada - 1]}`;
		  if(opcaoSelecionada==1){
			  const opcoes = [
				  'Já tenho um produto em mente, preciso apenas verificar seu catálogo!',
				  'Quero falar com um especialista, para discutir preço e melhores produtos!',
				  'Voltar para as opções anteriores!'
				];
				opp[message.from] = {
				opcoes: opcoes // Salvar as opções para uso futuro
				};
			   const opcoesINICIAL = opcoes.map((opcao, index) => `${index + 1}. ${opcao}`).join('\n');
			   resposta += `\n\nAgora, o que melhor se adequa? (digite apenas o número):\n${opcoesINICIAL}`;
			   estadosUsuarios[message.from] = 'comprar'; // Atualizar o estado para o segundo menu
		  }else if(opcaoSelecionada==2){
			  resposta += `\n\nPara trocar, ou até simples devolução do produto, ele precisa estar em *perfeito estado, sem marcas e na caixa original*, ok?\n caso contrário, conforme o CDC e entendimento jurisprudencial atual, mesmo que seja feito, a devolução não será aceita!`;
			  const opcoes = [
				  'Ainda tenho dúvidas se posso trocar meu produto!',
				  'Quero trocar o modelo!',
				  'Quero prosseguir com a troca por *outro produto*!',
				  'Quero trocar a cor!',
				  'Voltar para as opções anteriores!'
				  
				];
				opp[message.from] = {
				opcoes: opcoes // Salvar as opções para uso futuro
				};
			   const opcoesINICIAL = opcoes.map((opcao, index) => `${index + 1}. ${opcao}`).join('\n');
			   resposta += `\n\nAgora, o que melhor se adequa? (digite apenas o número):\n${opcoesINICIAL}`;
			   estadosUsuarios[message.from] = 'trocar'; // Atualizar o estado para o segundo menu
		  }else if(opcaoSelecionada==3){
			  resposta += `\n\nSelecione seu produto: (O nome do App fica no final do manual ;)`;
			  const opcoes = [
				  'SmartWatch App HryFine',
				  'Smartwatch App HiWatch',
				  'Drone',
				  'Tag GPS',
				  'Carrinho Controle Remoto',
				  'Depilador',
				  'Aspirador',
				  'Outro produto!',
				  'Voltar para as opções anteriores!'
				  
				];
				opp[message.from] = {
				opcoes: opcoes // Salvar as opções para uso futuro
				};
			   const opcoesINICIAL = opcoes.map((opcao, index) => `${index + 1}. ${opcao}`).join('\n');
			   resposta += `\n\n${opcoesINICIAL}`;
			   estadosUsuarios[message.from] = 'ajuda'; // Atualizar o estado para o segundo menu
		  }else if(opcaoSelecionada==4){
			  resposta += `\n\nCerto! \n 1 - me envie um video demonstrando como está fazendo por favor!\n2 - Informe a loja que realizou a compra e o nome do comprador\nE já, vou te transferir para o atendimento!`;
			   estadosUsuarios[message.from] = 'atendimento'; // Atualizar o estado para o segundo menu
		  }else if(opcaoSelecionada==5){
			  resposta += `\n\nInforme por favor, a loja que realizou a compra e o nome do comprador\nE já, vou te transferir para o atendimento!`;
			   estadosUsuarios[message.from] = 'atendimento'; // Atualizar o estado para o segundo menu
		  }else if(opcaoSelecionada==6){
			  resposta += `\n\nCerto! \n - me envie um video do problema!\n - Informe a loja que realizou a compra e o nome do comprador\nE já, vou te transferir para o atendimento!`;
			   estadosUsuarios[message.from] = 'atendimento'; // Atualizar o estado para o segundo menu
		  }else if(opcaoSelecionada==7){
			  resposta += `\n\nLembre-se, para devolução do produto, ele precisa estar em *perfeito estado, sem marcas e na caixa original*, ok?\n caso contrário, conforme o CDC e entendimento jurisdicional atual, mesmo que seja feito, a devolução não será aceita!`;
			    const opcoes = [
				  'Meu produto está em perfeito estado!',
				  'Meu produto contém avarias e/ou marcas de uso!',
				  'Voltar para as opções anteriores!'
				];
				opp[message.from] = {
				opcoes: opcoes // Salvar as opções para uso futuro
				};
			   const opcoesINICIAL = opcoes.map((opcao, index) => `${index + 1}. ${opcao}`).join('\n');
			   estadosUsuarios[message.from] = 'devolucao7';
			   resposta += `\n\n${opcoesINICIAL}`;
		  }else{
			  console.log('Não achou nada! '+opcaoSelecionada);
		  }
        } else {
          // Se não for uma opção válida, apenas envie uma mensagem indicando isso
          resposta = 'Opção inválida. Por favor, selecione uma opção válida, digitando apenas o número.';
        }
        break;
		
		
		case 'devolucao7':
			opcaoSelecionada = parseInt(corpoMensagem);
		  if (!isNaN(opcaoSelecionada) && opcaoSelecionada > 0 && opcaoSelecionada <= opcoes.length) {
			resposta = `Você selecionou a opção ${opcaoSelecionada}: ${opcoes[opcaoSelecionada - 1]}\n`;
		  if(opcaoSelecionada==1){
				estadosUsuarios[message.from] = 'atendimento'; // Atualizar o estado para o segundo menu
				resposta += "\nPor favor, informe o nome do comprador completo e a loja onde realizou a compra, após, vamos lhe transferir :)";
		 }else if(opcaoSelecionada==2){
				resposta += "\nComo seu produto contém avarias e/ou marcas de uso, impossibilita a devolução do mesmo por arrependimento, veja, tal condição ampara apenas testes simples e verificação do produto por parte do cliente, não para produtos avariados :( \nPois imagine você comprar um celular em uma loja, mas quando sair, infelizmente deixar cair e quebrar, é algo horrível, mas a loja não tem responsabilidade pela avaria, espero que entenda ;)";
				retornarInicio(message.from);
		 }else if(opcaoSelecionada==3){
				enviarMensagemInicial(message, horaAtual, message.from);
				return;
		  }		  
		  
			} else {
			  // Se não for uma opção válida, apenas envie uma mensagem indicando isso
			  resposta = 'Opção inválida. Por favor, selecione uma opção válida, digitando apenas o número.';
			}
		break;
		
		
		case 'ajuda':
		opcaoSelecionada = parseInt(corpoMensagem);
		  if (!isNaN(opcaoSelecionada) && opcaoSelecionada > 0 && opcaoSelecionada <= opcoes.length) {
			resposta = "Você selecionou a opção "+opcaoSelecionada+": "+opcoes[opcaoSelecionada - 1]+"\n";
		  if(opcaoSelecionada==1){
				resposta += "Temos um link especifico em nosso site com videos para o seu produto, que irá te ajudar, os videos são rápidos, especificos e ensinam o passo a passo:\n https://marcelowatch.com.br/ajuda/w6";
				retornarInicio(message.from);
		 }else if(opcaoSelecionada==2){
				resposta += "Temos um link especifico em nosso site com videos para o seu produto, que irá te ajudar, os videos são rápidos, especificos e ensinam o passo a passo:\n https://marcelowatch.com.br/ajuda/hiw";
				retornarInicio(message.from);
		  }else if(opcaoSelecionada==3){
				resposta += "Temos um link especifico em nosso site com videos para o seu produto, que irá te ajudar, os videos são rápidos, especificos e ensinam o passo a passo:\n https://marcelowatch.com.br/ajuda/dro";
				retornarInicio(message.from);
		  }else if(opcaoSelecionada==4){
				resposta += "Temos um link especifico em nosso site com videos para o seu produto, que irá te ajudar, os videos são rápidos, especificos e ensinam o passo a passo:\n https://marcelowatch.com.br/ajuda/tag";
				retornarInicio(message.from);
		  }else if(opcaoSelecionada==5){
				resposta += "Temos um link especifico em nosso site com videos para o seu produto, que irá te ajudar, os videos são rápidos, especificos e ensinam o passo a passo:\n https://marcelowatch.com.br/ajuda/car";
				retornarInicio(message.from);
		  }else if(opcaoSelecionada==6){
				resposta += "Temos um link especifico em nosso site com videos para o seu produto, que irá te ajudar, os videos são rápidos, especificos e ensinam o passo a passo:\n https://marcelowatch.com.br/ajuda/dep";
				retornarInicio(message.from);
		  }else if(opcaoSelecionada==7){
				resposta += "Temos um link especifico em nosso site com videos para o seu produto, que irá te ajudar, os videos são rápidos, especificos e ensinam o passo a passo:\n https://marcelowatch.com.br/ajuda/rob";
				retornarInicio(message.from);
		  }else if(opcaoSelecionada==8){
				resposta += "Certo, quer que eu te transfira para o atendimento?";
				retornarInicio(message.from);
		  }else if(opcaoSelecionada==9){
				enviarMensagemInicial(message, horaAtual, message.from);
				return;
		  }		  
		  
        } else {
          // Se não for uma opção válida, apenas envie uma mensagem indicando isso
          resposta = 'Opção inválida. Por favor, selecione uma opção válida, digitando apenas o número.';
        }
		break;
	   case 'trocar':
	   opcaoSelecionada = parseInt(corpoMensagem);
		if (!isNaN(opcaoSelecionada) && opcaoSelecionada > 0 && opcaoSelecionada <= opcoes.length) {
		  if(opcaoSelecionada==1){
				resposta = "O prazo de 7 dias é dado para os consumidores apenas fazerem testes simples e verificarem a procedência/qualidade do produto! Isto significa, que o produto não pode conter avarias e/ou marcas de uso permanentes! Se seu produto já contém algum desses indicios, por favor, colabore conosco :)";
				delete estadosUsuarios[message.from];
		 }else if(opcaoSelecionada==2){
				 resposta = `Você selecionou a opção ${opcaoSelecionada}: ${opcoes[opcaoSelecionada - 1]}\nDeseja atendimento?`;
				estadosUsuarios[message.from] = 'atendimento'; // Atualizar o estado para o segundo menu
		  }else if(opcaoSelecionada==3){
				resposta = `Você selecionou a opção ${opcaoSelecionada}: ${opcoes[opcaoSelecionada - 1]}\nDeseja atendimento?`;
				estadosUsuarios[message.from] = 'atendimento'; // Atualizar o estado para o segundo menu
		  }else if(opcaoSelecionada==4){
				resposta = `Você selecionou a opção ${opcaoSelecionada}: ${opcoes[opcaoSelecionada - 1]}\nDeseja atendimento?`;
				estadosUsuarios[message.from] = 'atendimento'; // Atualizar o estado para o segundo menu
		  }else if(opcaoSelecionada==5){
				enviarMensagemInicial(message, horaAtual, message.from);
		  }			
		  
        } else {
          // Se não for uma opção válida, apenas envie uma mensagem indicando isso
          resposta = 'Opção inválida. Por favor, selecione uma opção válida, digitando apenas o número.';
        }
	   break;





      case 'comprar':
	  opcaoSelecionada = parseInt(corpoMensagem);
        if (!isNaN(opcaoSelecionada) && opcaoSelecionada > 0 && opcaoSelecionada <= opcoes.length) {
		  if(opcaoSelecionada==1){
				resposta = "Perfeito, você pode consultar nossos produtos diretamente pelo nosso site:\nhttps://marcelowatch.com.br/ \n e qualquer dúvida, você pode digitar aqui em baixo, que vamos iniciar o atendimento ;)";
				estadosUsuarios[message.from] = 'atendimento'; // Atualizar o estado para o segundo menu
		 }else if(opcaoSelecionada==2){
				resposta = "Por favor, já me informe se tem uma categoria em mente, modo de compra, que já vou te transferir!"; 
				estadosUsuarios[message.from] = 'atendimento'; // Atualizar o estado para o segundo menu
		  }else if(opcaoSelecionada==3){
				enviarMensagemInicial(message, horaAtual, message.from);
		  }			
		  
        } else {
          // Se não for uma opção válida, apenas envie uma mensagem indicando isso
          resposta = 'Opção inválida. Por favor, selecione uma opção válida, digitando apenas o número.';
        }		
        break;
		
		
	  case 'atendimento':
		if (horaAtual >= horarioAtendimentoInicio && horaAtual < horarioAtendimentoFim) {
			resposta = 'Perfeito, já reuni todas as informações, assim, irei transferir o mais rápido possível para um atendente ;)';
		}else{
			resposta = "Recebemos sua mensagem, você já pode ir informando sua dúvida ;)\nNosso horário de atendimento é das "+horarioAtendimentoInicio+" às "+horarioAtendimentoFim+", sendo de segunda a sexta.\n\nNãose preocupe com prazos, não precisa mandar mensagem em outro canal, vamos responder aqui ;)";
		}
		etiquetar(message.from, "Novo cliente", "adicionar");
		//adicionar usuario como em atendimento	na sessão atual	
		usuariosAtendidos.push(message.from);
		
		//aqui é pra salvar em arquivo e para futuras sessões tbm
		//fs.writeFileSync(ATENDIDOS_FILE_PATH, JSON.stringify(usuariosAtendidos));
	   break;
	   
	   
    }
  }

  // Enviar a resposta
  message.reply(resposta);
  console.log("Resposta enviada: " + resposta);
});

client.initialize();
