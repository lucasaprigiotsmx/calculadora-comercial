const regras = {
  muito_baixa: { nome: "Nível 01 - Muito baixa", faixas: [{ max: 500, valor: 350 }, { max: 1000, valor: 450 }, { max: 2000, valor: 550 }, { max: 2500, valor: 650 }], adicional: 0.20, teto: 1500 },
  baixa: { nome: "Nível 02 - Baixa", faixas: [{ max: 500, valor: 450 }, { max: 1000, valor: 600 }, { max: 2000, valor: 750 }, { max: 2500, valor: 850 }], adicional: 0.20, teto: 2500 },
  media: { nome: "Nível 03 - Média", faixas: [{ max: 500, valor: 600 }, { max: 1000, valor: 800 }, { max: 2000, valor: 950 }, { max: 2500, valor: 1100 }], adicional: 0.20, teto: 4000 },
  alta: { nome: "Nível 04 - Alta", faixas: [{ max: 500, valor: 750 }, { max: 1000, valor: 1000 }, { max: 2000, valor: 1200 }, { max: 2500, valor: 1400 }], adicional: 0.20, teto: 6000 }
};

function moeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

let resultData = {};

function atualizarFormulario() {
  const tipo = document.getElementById("tipo_servico").value;
  const boxComplexidade = document.getElementById("box-complexidade");
  const gridDinamico = document.getElementById("grid-dinamico");

  if (tipo === "importacao") {
    boxComplexidade.style.display = "block";
    gridDinamico.style.gridTemplateColumns = "1fr 1fr";
  } else {
    boxComplexidade.style.display = "none";
    gridDinamico.style.gridTemplateColumns = "1fr"; // Ocupa a linha toda
  }
}

function calcular() {
  const tipoServico = document.getElementById("tipo_servico").value;
  let clientes = Number(document.getElementById("clientes").value);

  if (!clientes || clientes < 1) {
    alert("Informe uma quantidade válida de clientes.");
    return;
  }

  let valor = 0;
  let faixa = "";
  let nomeServico = "";
  let tetoAtingido = false;

  if (tipoServico === "importacao") {
    const complexidade = document.getElementById("complexidade").value;
    const regra = regras[complexidade];
    nomeServico = "Importação (" + regra.nome + ")";
    
    if (clientes <= 2500) {
      for (let i = 0; i < regra.faixas.length; i++) {
        if (clientes <= regra.faixas[i].max) {
          valor = regra.faixas[i].valor;
          if (regra.faixas[i].max === 500) faixa = "1 a 500";
          else if (regra.faixas[i].max === 1000) faixa = "501 a 1.000";
          else if (regra.faixas[i].max === 2000) faixa = "1.001 a 2.000";
          else faixa = "2.001 a 2.500";
          break;
        }
      }
    } else {
      const clientesExcedentes = clientes - 2500;
      const ultimoValor = regra.faixas[regra.faixas.length - 1].valor;
      valor = ultimoValor + (clientesExcedentes * regra.adicional);
      faixa = "Acima de 2.500";
      if (valor >= regra.teto) {
        valor = regra.teto;
        tetoAtingido = true;
      }
    }
  } else if (tipoServico === "migracao_pop") {
    nomeServico = "Migração de POP (SGP -> SGP)";
    if (clientes <= 500) { valor = 450; faixa = "1 a 500"; }
    else if (clientes <= 1000) { valor = 600; faixa = "501 a 1.000"; }
    else if (clientes <= 2000) { valor = 750; faixa = "1.001 a 2.000"; }
    else if (clientes <= 2500) { valor = 850; faixa = "2.001 a 2.500"; }
    else { 
      const excedente = clientes - 2500;
      valor = 850 + (excedente * 0.15);
      faixa = "Acima de 2.500 (+ R$ 0,15 un.)"; 
      if (valor >= 4000) {
        valor = 4000;
        tetoAtingido = true;
      }
    }
  } else if (tipoServico === "unificacao") {
    nomeServico = "Unificação de Bases";
    if (clientes <= 500) {
      valor = 350;
      faixa = "Base inicial (até 500 clientes)";
    } else {
      const excedente = clientes - 500;
      valor = 350 + (excedente * 0.10);
      faixa = `Excedente a 500 clientes (+ R$ 0,10 un.)`;
      if (valor >= 3000) {
        valor = 3000;
        tetoAtingido = true;
      }
    }
  }

  const valorSugeridoInicial = valor * 0.95; // 5% Desconto
  const valorMaximoPermitido = valor * 0.85; // 15% Desconto

  resultData = {
    nomeServico: nomeServico,
    clientes: clientes.toLocaleString("pt-BR"),
    valorBruto: moeda(valor),
    valorSugeridoInicial: moeda(valorSugeridoInicial),
    valorMaximoPermitido: moeda(valorMaximoPermitido)
  };

  document.getElementById("resultado").classList.remove("hidden");
  document.getElementById("badgeComplexidade").textContent = nomeServico;
  document.getElementById("valorSugerido").textContent = resultData.valorBruto;
  document.getElementById("valorSugeridoInicial").textContent = resultData.valorSugeridoInicial;
  document.getElementById("clientesResultado").textContent = resultData.clientes;
  document.getElementById("faixaResultado").textContent = faixa;
  document.getElementById("valorMaximoPermitido").textContent = resultData.valorMaximoPermitido;

  const alerta = document.getElementById("alertaNegociacao");
  if (tetoAtingido) alerta.classList.remove("hidden");
  else alerta.classList.add("hidden");
}

function copiarResultado() {
  if (!resultData.valorBruto) return;
  const texto = `Proposta de Serviços TSMX\nModalidade: ${resultData.nomeServico}\nBase de Assinantes: ${resultData.clientes} clientes\n\nValor Bruto: ${resultData.valorBruto}\nDesconto Sugerido (5%): ${resultData.valorSugeridoInicial}\nDesconto Máximo Permitido (15%): ${resultData.valorMaximoPermitido}`;
  
  navigator.clipboard.writeText(texto).then(() => {
    alert("Resumo comercial copiado com sucesso! Você pode colar direto na proposta ou WhatsApp do cliente.");
  }).catch(err => {
    console.error('Erro ao copiar', err);
  });
}

document.getElementById("clientes").addEventListener("keydown", function(event) {
  if (event.key === "Enter") calcular();
});
