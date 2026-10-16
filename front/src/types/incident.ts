export type IncidentCategory =
  | 'acidente_com_veiculo'
  | 'acidente_com_vitimas'
  | 'clima_atipico'
  | 'problema_mecanico'
  | 'bloqueio_de_pista';

export type Criticity = 'baixa' | 'media' | 'alta';

export type Status = 'aberto' | 'fechado' | 'em_investigacao' | 'inconclusivo';

export interface Incident {
  id: string;
  truck_plate: string;
  driver_name: string;
  driver_phone: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string | null;
  category: IncidentCategory;
  criticity: Criticity;
  status: Status;
  created_at: string;
  updated_at: string | null;
}

export interface IncidentCreatePayload {
  truck_plate: string;
  driver_name: string;
  driver_phone: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  category: IncidentCategory;
  criticity: Criticity;
}

export interface IncidentUpdatePayload {
  truck_plate?: string;
  driver_name?: string;
  driver_phone?: string;
  latitude?: number;
  longitude?: number;
  title?: string;
  description?: string;
  category?: IncidentCategory;
  criticity?: Criticity;
  status?: Status;
}

export interface OptionItem {
  value: string;
  label: string;
}

export interface IncidentOptions {
  categories: OptionItem[];
  criticities: OptionItem[];
  statuses: OptionItem[];
}

export interface IncidentFilterParams {
  page?: number;
  size?: number;
  status?: Status | '';
  criticity?: Criticity | '';
  category?: IncidentCategory | '';
  truck_plate?: string;
}

export const INCIDENT_CATEGORY_LABELS: Record<IncidentCategory, string> = {
  acidente_com_veiculo: 'Acidente com veículo',
  acidente_com_vitimas: 'Acidente com vítimas',
  clima_atipico: 'Condição Climática Atípica na Pista',
  problema_mecanico: 'Problema mecânico',
  bloqueio_de_pista: 'Bloqueio de pista',
};

export const CRITICITY_LABELS: Record<Criticity, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
};

export const STATUS_LABELS: Record<Status, string> = {
  aberto: 'Aberto',
  fechado: 'Fechado',
  em_investigacao: 'Em Investigação',
  inconclusivo: 'Inconclusivo',
};
