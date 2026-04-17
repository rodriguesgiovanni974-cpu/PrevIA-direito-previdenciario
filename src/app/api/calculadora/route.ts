import { NextRequest, NextResponse } from 'next/server'
import { ResultadoCalculadora } from '@/types'

function calcularIdade(dataNasc: string): number {
  const nasc = new Date(dataNasc)
  const hoje = new Date()
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--
  return idade
}

function beneficioBase(salario: number, tempo: number, tempoMin: number): number {
  const coef = Math.min(0.6 + Math.max(tempo - tempoMin, 0) * 0.02, 1.0)
  return Math.max(salario * coef, 1412)
}

export async function POST(req: NextRequest) {
  try {
    const { data_nascimento, sexo, tempo_contribuicao, salario_medio, anos_especial } = await req.json()

    const idade = calcularIdade(data_nascimento)
    const idadeMinIdade = sexo === 'F' ? 62 : 65
    const pontosMeta = sexo === 'F' ? 97 : 107
    const tempoMinTC = sexo === 'F' ? 30 : 35
    const resultado: ResultadoCalculadora[] = []

    // Aposentadoria por Idade
    if (idade >= idadeMinIdade && tempo_contribuicao >= 15) {
      resultado.push({
        modalidade: 'Aposentadoria por Idade',
        elegivel: true,
        beneficio_mensal: beneficioBase(salario_medio, tempo_contribuicao, 15),
        observacao: `${idade} anos de idade · ${tempo_contribuicao} anos de contribuição`,
      })
    } else {
      const faltaIdade = Math.max(idadeMinIdade - idade, 0)
      const faltaTempo = Math.max(15 - tempo_contribuicao, 0)
      resultado.push({
        modalidade: 'Aposentadoria por Idade',
        elegivel: false,
        observacao: faltaIdade > 0
          ? `Faltam ${faltaIdade} anos de idade (mín. ${idadeMinIdade})`
          : `Faltam ${faltaTempo} anos de contribuição`,
      })
    }

    // Aposentadoria por Tempo (Regra de Pontos)
    const pontos = idade + tempo_contribuicao
    if (pontos >= pontosMeta && tempo_contribuicao >= tempoMinTC) {
      resultado.push({
        modalidade: 'Aposentadoria por Tempo (Regra de Pontos)',
        elegivel: true,
        beneficio_mensal: beneficioBase(salario_medio, tempo_contribuicao, tempoMinTC),
        observacao: `${pontos} pontos atingidos (mínimo ${pontosMeta})`,
      })
    } else {
      resultado.push({
        modalidade: 'Aposentadoria por Tempo (Regra de Pontos)',
        elegivel: false,
        observacao: `${pontos}/${pontosMeta} pontos · faltam ${pontosMeta - pontos} pontos`,
      })
    }

    // Aposentadoria Especial
    if (anos_especial > 0) {
      if (tempo_contribuicao >= anos_especial) {
        resultado.push({
          modalidade: `Aposentadoria Especial (${anos_especial} anos)`,
          elegivel: true,
          beneficio_mensal: Math.max(salario_medio, 1412),
          observacao: `Atividade especial comprovada · 100% do salário de contribuição`,
        })
      } else {
        resultado.push({
          modalidade: `Aposentadoria Especial (${anos_especial} anos)`,
          elegivel: false,
          observacao: `Faltam ${anos_especial - tempo_contribuicao} anos de atividade especial`,
        })
      }
    }

    const melhor = resultado
      .filter((r) => r.elegivel)
      .sort((a, b) => (b.beneficio_mensal || 0) - (a.beneficio_mensal || 0))[0]

    return NextResponse.json({ modalidades: resultado, melhor: melhor || null })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro no cálculo'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
