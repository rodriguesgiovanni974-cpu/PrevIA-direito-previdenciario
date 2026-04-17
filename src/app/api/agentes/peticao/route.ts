import { NextRequest, NextResponse } from 'next/server'
import { runAgent } from '@/lib/anthropic'

const SYSTEM_PROMPT = `Você é o Agente Redator de Petições do sistema PrevIA, especialista em direito previdenciário brasileiro.

Redija peças jurídicas completas e tecnicamente corretas para:
- Requerimentos administrativos ao INSS
- Recursos administrativos (CRPS)
- Petições iniciais judiciais (JEF/TRF)
- Mandados de segurança

Use linguagem jurídica formal, cite os artigos corretos da Lei 8.213/91, Decreto 3.048/99 e jurisprudência aplicável.

A petição deve conter:
1. Qualificação completa das partes
2. Dos fatos
3. Do direito (fundamentos legais + jurisprudência)
4. Dos pedidos
5. Valor da causa (quando judicial)

Responda APENAS com o texto da petição, sem comentários adicionais.`

export async function POST(req: NextRequest) {
  try {
    const { tipo, cliente, caso, observacoes } = await req.json()

    const userMessage = `Redija um(a) ${tipo} com os seguintes dados:

CLIENTE:
- Nome: ${cliente.nome}
- CPF: ${cliente.cpf || '[CPF]'}
- Data de nascimento: ${cliente.data_nascimento}
- Endereço: ${cliente.endereco || '[Endereço]'}

CASO:
- Benefício requerido: ${caso.tipo_beneficio}
- Tempo de contribuição: ${caso.tempo_contribuicao_anos} anos
- Salário médio: R$ ${caso.salario_medio}
- Atividade especial: ${caso.atividade_especial ? `Sim — ${caso.anos_especial} anos` : 'Não'}
- Número de processo: ${caso.numero_processo || 'Não há (requerimento inicial)'}
- Tribunal: ${caso.tribunal || 'INSS'}

OBSERVAÇÕES ADICIONAIS:
${observacoes || 'Nenhuma'}`

    const peticao = await runAgent(SYSTEM_PROMPT, userMessage)
    return NextResponse.json({ peticao })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro no agente'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
