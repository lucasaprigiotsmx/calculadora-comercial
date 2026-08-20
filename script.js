const regras = {
  muito_baixa: { nome: "Nível 01 - Muito baixa", faixas: [{ max: 500, valor: 350 }, { max: 1000, valor: 450 }, { max: 2000, valor: 550 }, { max: 2500, valor: 650 }], adicional: 0.10, teto: 1500 },
  baixa: { nome: "Nível 02 - Baixa", faixas: [{ max: 500, valor: 450 }, { max: 1000, valor: 600 }, { max: 2000, valor: 750 }, { max: 2500, valor: 850 }], adicional: 0.15, teto: 2500 },
  media: { nome: "Nível 03 - Média", faixas: [{ max: 500, valor: 600 }, { max: 1000, valor: 800 }, { max: 2000, valor: 950 }, { max: 2500, valor: 1100 }], adicional: 0.20, teto: 4000 },
  alta: { nome: "Nível 04 - Alta", faixas: [{ max: 500, valor: 750 }, { max: 1000, valor: 1000 }, { max: 2000, valor: 1200 }, { max: 2500, valor: 1400 }], adicional: 0.25, teto: 6000 }
};

function moeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

let resultData = {};

function calcular() {
  const complexidade = document.getElementById("complexidade").value;
  let clientes = Number(document.getElementById("clientes").value);

  if (!clientes || clientes < 1) {
    alert("Informe uma quantidade válida de clientes.");
    return;
  }

  const regra = regras[complexidade];
  let valor = 0;
  let faixa = "";

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
    if (valor >= regra.teto) valor = regra.teto;
  }

  const valorMinimo = valor * 0.85; // 15% Desconto
  const valorLideranca = valor * 0.80; // 20% Desconto

  resultData = {
    complexidade: regra.nome,
    clientes: clientes.toLocaleString("pt-BR"),
    valorBruto: moeda(valor),
    valorMinimo: moeda(valorMinimo),
    valorLideranca: moeda(valorLideranca)
  };

  document.getElementById("resultado").classList.remove("hidden");
  document.getElementById("badgeComplexidade").textContent = regra.nome;
  document.getElementById("valorSugerido").textContent = resultData.valorBruto;
  document.getElementById("valorMinimo").textContent = resultData.valorMinimo;
  document.getElementById("clientesResultado").textContent = resultData.clientes;
  document.getElementById("faixaResultado").textContent = faixa;
  document.getElementById("valorLideranca").textContent = resultData.valorLideranca;

  const alerta = document.getElementById("alertaNegociacao");
  if (clientes > 2500 && valor >= regra.teto) alerta.classList.remove("hidden");
  else alerta.classList.add("hidden");
}

function copiarResultado() {
  if (!resultData.valorBruto) return;
  const texto = `Proposta de Importação SGP\nNível do Sistema: ${resultData.complexidade}\nBase de Assinantes: ${resultData.clientes} clientes\n\nValor Bruto: ${resultData.valorBruto}\nValor Mínimo (Autonomia Comercial 15%): ${resultData.valorMinimo}\nValor Mínimo (Aprovação Liderança 20%): ${resultData.valorLideranca}`;
  
  navigator.clipboard.writeText(texto).then(() => {
    alert("Resumo comercial copiado com sucesso! Você pode colar direto na proposta ou WhatsApp do cliente.");
  }).catch(err => {
    console.error('Erro ao copiar', err);
  });
}

document.getElementById("clientes").addEventListener("keydown", function(event) {
  if (event.key === "Enter") calcular();
});
