const BASE_URL = process.env.DATAJUD_BASE_URL!
const API_KEY = process.env.DATAJUD_API_KEY!

export type Tribunal =
  | 'trf1' | 'trf2' | 'trf3' | 'trf4' | 'trf5' | 'trf6'
  | 'tjsp' | 'tjmg' | 'tjrj' | 'tjrs' | 'stj'

export interface ProcessoDataJud {
  id: string
  numeroProcesso: string
  tribunal: string
  classe: { nome: string }
  assuntos: { nome: string }[]
  orgaoJulgador: { nome: string }
  dataAjuizamento: string
  movimentos: { dataHora: string; nome: string }[]
  partes: { nome: string; tipo: string }[]
}

export async function buscarProcesso(
  tribunal: Tribunal,
  numeroProcesso: string
): Promise<ProcessoDataJud[]> {
  const alias = `api_publica_${tribunal}`
  const body = {
    query: {
      match: { numeroProcesso },
    },
    size: 5,
  }

  const res = await fetch(`${BASE_URL}/${alias}/_search`, {
    method: 'POST',
    headers: {
      Authorization: `APIKey ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`DataJud erro ${res.status}: ${await res.text()}`)
  }

  const data = await res.json()
  return (data?.hits?.hits ?? []).map((h: { _source: ProcessoDataJud }) => h._source)
}

export async function buscarPorParte(
  tribunal: Tribunal,
  nomeParte: string
): Promise<ProcessoDataJud[]> {
  const alias = `api_publica_${tribunal}`
  const body = {
    query: {
      match_phrase: { 'partes.nome': nomeParte },
    },
    size: 10,
    sort: [{ dataAjuizamento: { order: 'desc' } }],
  }

  const res = await fetch(`${BASE_URL}/${alias}/_search`, {
    method: 'POST',
    headers: {
      Authorization: `APIKey ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error(`DataJud erro ${res.status}`)

  const data = await res.json()
  return (data?.hits?.hits ?? []).map((h: { _source: ProcessoDataJud }) => h._source)
}

export async function verificarMovimentacoes(
  tribunal: Tribunal,
  numeroProcesso: string,
  dataUltimaConsulta: string
): Promise<ProcessoDataJud['movimentos']> {
  const processos = await buscarProcesso(tribunal, numeroProcesso)
  if (!processos.length) return []

  const processo = processos[0]
  const novasMovs = processo.movimentos.filter(
    (m) => new Date(m.dataHora) > new Date(dataUltimaConsulta)
  )
  return novasMovs
}
