const regras = {
  nivel_01: { nome: "Nível 01 - Muito baixa", faixas: [{ max: 500, valor: 450 }, { max: 1000, valor: 700 }, { max: 2000, valor: 1000 }, { max: 3000, valor: 1200 }], adicional: 0.20 },
  nivel_02: { nome: "Nível 02 - Baixa", faixas: [{ max: 500, valor: 550 }, { max: 1000, valor: 900 }, { max: 2000, valor: 1400 }, { max: 3000, valor: 1800 }], adicional: 0.20 },
  nivel_03: { nome: "Nível 03 - Média", faixas: [{ max: 500, valor: 650 }, { max: 1000, valor: 1100 }, { max: 2000, valor: 1800 }, { max: 3000, valor: 2100 }], adicional: 0.20 },
  nivel_04: { nome: "Nível 04 - Média alta", faixas: [{ max: 500, valor: 800 }, { max: 1000, valor: 1400 }, { max: 2000, valor: 2400 }, { max: 3000, valor: 3000 }], adicional: 0.20 },
  nivel_05: { nome: "Nível 05 - Alta", faixas: [{ max: 500, valor: 900 }, { max: 1000, valor: 1600 }, { max: 2000, valor: 2800 }, { max: 3000, valor: 3600 }], adicional: 0.20 },
  nivel_06: { nome: "Nível 06 - Muito alta", faixas: [{ max: 500, valor: 1000 }, { max: 1000, valor: 1800 }, { max: 2000, valor: 3200 }, { max: 3000, valor: 4200 }], adicional: 0.20 }
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
    
    if (clientes <= 3000) {
      for (let i = 0; i < regra.faixas.length; i++) {
        if (clientes <= regra.faixas[i].max) {
          valor = regra.faixas[i].valor;
          if (regra.faixas[i].max === 500) faixa = "1 a 500";
          else if (regra.faixas[i].max === 1000) faixa = "501 a 1.000";
          else if (regra.faixas[i].max === 2000) faixa = "1.001 a 2.000";
          else faixa = "2.001 a 3.000";
          break;
        }
      }
    } else {
      const ultimoValor = regra.faixas[regra.faixas.length - 1].valor;
      valor = ultimoValor + (clientes * regra.adicional);
      faixa = "Acima de 3.000 (+ R$ 0,20 por cliente - Sobre Total)";
    }
  } else if (tipoServico === "migracao_pop") {
    nomeServico = "Migração de POP (SGP -> SGP)";
    if (clientes <= 500) { valor = 450; faixa = "1 a 500"; }
    else if (clientes <= 1000) { valor = 700; faixa = "501 a 1.000"; }
    else if (clientes <= 2000) { valor = 1000; faixa = "1.001 a 2.000"; }
    else if (clientes <= 2500) { valor = 1200; faixa = "2.001 a 2.500"; }
    else { 
      valor = 1200 + (clientes * 0.20);
      faixa = "Acima de 2.500 (+ R$ 0,20 por cliente - Sobre Total)"; 
    }
  } else if (tipoServico === "unificacao") {
    nomeServico = "Unificação de Bases";
    if (clientes <= 500) {
      valor = 350;
      faixa = "Base inicial (até 500 clientes)";
    } else {
      const excedente = clientes - 500;
      valor = 350 + (excedente * 0.20);
      faixa = `Excedente a 500 clientes (+ R$ 0,20 un.)`;
      if (valor >= 4500) {
        valor = 4500;
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
