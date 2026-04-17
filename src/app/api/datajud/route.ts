import { NextRequest, NextResponse } from 'next/server'
import { buscarProcesso, buscarPorParte, Tribunal } from '@/lib/datajud'

export async function POST(req: NextRequest) {
  try {
    const { tribunal, numeroProcesso, nomeParte } = await req.json()

    if (!tribunal) {
      return NextResponse.json({ error: 'tribunal obrigatório' }, { status: 400 })
    }

    let resultados
    if (numeroProcesso) {
      resultados = await buscarProcesso(tribunal as Tribunal, numeroProcesso)
    } else if (nomeParte) {
      resultados = await buscarPorParte(tribunal as Tribunal, nomeParte)
    } else {
      return NextResponse.json({ error: 'numeroProcesso ou nomeParte obrigatório' }, { status: 400 })
    }

    return NextResponse.json({ resultados, total: resultados.length })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
