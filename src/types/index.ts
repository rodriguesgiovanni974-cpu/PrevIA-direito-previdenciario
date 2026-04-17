export type Sexo = 'M' | 'F'

export type FaseProcesso =
  | 'triagem'
  | 'requerimento'
  | 'aguardando_inss'
  | 'recurso'
  | 'judicial'
  | 'exitoso'
  | 'encerrado'

export type TipoBeneficio =
  | 'aposentadoria_tempo'
  | 'aposentadoria_idade'
  | 'aposentadoria_especial'
  | 'auxilio_doenca'
  | 'bpc_loas'
  | 'pensao_morte'
  | 'revisao_vida_toda'

export interface Cliente {
  id: string
  nome: string
  cpf: string
  telefone: string
  email?: string
  data_nascimento: string
  sexo: Sexo
  created_at: string
}

export interface Caso {
  id: string
  cliente_id: string
  cliente?: Cliente
  tipo_beneficio: TipoBeneficio
  fase: FaseProcesso
  numero_processo?: string
  tribunal?: string
  probabilidade_exito?: number
  score_risco?: number
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface Movimentacao {
  id: string
  caso_id: string
  descricao: string
  descricao_simples?: string
  data_movimentacao: string
  notificado_cliente: boolean
  created_at: string
}

export interface Peticao {
  id: string
  caso_id: string
  tipo: string
  conteudo: string
  status: 'rascunho' | 'revisao' | 'aprovada' | 'protocolada'
  created_at: string
}

export interface Pericia {
  id: string
  caso_id: string
  cliente?: Cliente
  data_hora: string
  local: string
  lembrete_enviado: boolean
  resultado?: 'aprovada' | 'negada' | 'pendente'
  created_at: string
}

export interface ResultadoTriagem {
  elegivel: boolean
  modalidade_recomendada: string
  probabilidade: number
  documentos_necessarios: string[]
  observacoes: string
  tempo_contribuicao_anos: number
  beneficio_estimado?: number
}

export interface ResultadoCalculadora {
  modalidade: string
  elegivel: boolean
  beneficio_mensal?: number
  observacao: string
  data_elegibilidade?: string
}
