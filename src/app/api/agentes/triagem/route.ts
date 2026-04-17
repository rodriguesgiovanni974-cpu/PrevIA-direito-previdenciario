import { NextRequest, NextResponse } from 'next/server'
import { runAgent } from '@/lib/anthropic'
import { ResultadoTriagem } from '@/types'

const SYSTEM_PROMPT = `Você é o Agente Triador do sistema PrevIA, especialista em direito previdenciário brasileiro.

Seu papel é analisar os dados de um potencial cliente e determinar:
1. Se ele tem direito a algum benefício previdenciário
2. Qual modalidade é mais indicada (aposentadoria por idade, tempo, especial, auxílio-doença, BPC/LOAS, pensão por morte)
3. A probabilidade de êxito (0-100%)
4. Quais documentos são necessários
5. Uma estimativa de benefício mensal

Regras importantes:
- Aposentadoria por Idade: 65 anos (homem) / 62 anos (mulher) + mínimo 15 anos de contribuição
- Aposentadoria por Tempo: Regra de pontos 97 (mulher) / 107 (homem) = idade + tempo de contribuição
- Aposentadoria Especial: 15, 20 ou 25 anos em atividade especial conforme o grau de risco
- Auxílio-doença: Incapacidade temporária + 12 contribuições (ou qualidade de segurado)
- BPC/LOAS: Deficiência ou 65+ anos + renda per capita familiar até 1/4 do salário mínimo

Responda SEMPRE em JSON válido com esta estrutura:
{
  "elegivel": boolean,
  "modalidade_recomendada": string,
  "probabilidade": number (0-100),
  "documentos_necessarios": string[],
  "observacoes": string,
  "tempo_contribuicao_anos": number,
  "beneficio_estimado": number
}`

export async function POST(req: NextRequest) {
  try {
    const dados = await req.json()

    const userMessage = `Analise este cliente para elegibilidade previdenciária:

Nome: ${dados.nome || 'Não informado'}
Data de nascimento: ${dados.data_nascimento || 'Não informado'}
Sexo: ${dados.sexo === 'F' ? 'Feminino' : 'Masculino'}
Tempo de contribuição estimado: ${dados.tempo_contribuicao_anos || 0} anos
Salário médio de contribuição: R$ ${dados.salario_medio || 0}
Atividade especial: ${dados.atividade_especial ? `Sim — ${dados.anos_especial} anos (grau ${dados.grau_especial})` : 'Não'}
Situação atual: ${dados.situacao || 'Não informado'}
Observações: ${dados.observacoes || 'Nenhuma'}`

    const resposta = await runAgent(SYSTEM_PROMPT, userMessage)

    const resultado: ResultadoTriagem = JSON.parse(resposta)
    return NextResponse.json(resultado)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro no agente'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
