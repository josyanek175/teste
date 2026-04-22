export interface WhatsAppNumber {
  id: string;
  phone: string;
  label: string;
  status: 'connected' | 'disconnected';
  connectedAt?: Date;
  organizationId?: string; // future multi-tenant
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  email?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  numberId: string;
  content: string;
  timestamp: Date;
  direction: 'incoming' | 'outgoing';
  status: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  numberId: string;
  contact: Contact;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  status: 'open' | 'active' | 'closed';
  assignedTo?: string;
  firstResponseTime?: number;
  totalTime?: number;
}

export interface Agent {
  id: string;
  name: string;
  role: 'admin' | 'agent' | 'supervisor';
  status: 'online' | 'offline' | 'busy';
  activeChats: number;
  avatar?: string;
  allowedNumbers: string[]; // 'all' or specific IDs
}

// ── WhatsApp Numbers ──
export const whatsappNumbers: WhatsAppNumber[] = [
  { id: 'wn1', phone: '+55 11 99900-0001', label: 'Suporte', status: 'connected', connectedAt: new Date(Date.now() - 86400000 * 30) },
  { id: 'wn2', phone: '+55 11 99900-0002', label: 'Vendas', status: 'connected', connectedAt: new Date(Date.now() - 86400000 * 15) },
  { id: 'wn3', phone: '+55 11 99900-0003', label: 'Financeiro', status: 'disconnected' },
];

// ── Agents ──
export const agents: Agent[] = [
  { id: '1', name: 'Carlos Silva', role: 'admin', status: 'online', activeChats: 3, allowedNumbers: ['all'] },
  { id: '2', name: 'Ana Santos', role: 'agent', status: 'online', activeChats: 5, allowedNumbers: ['wn1', 'wn2'] },
  { id: '3', name: 'Pedro Lima', role: 'agent', status: 'busy', activeChats: 4, allowedNumbers: ['wn1'] },
  { id: '4', name: 'Maria Costa', role: 'supervisor', status: 'online', activeChats: 1, allowedNumbers: ['all'] },
  { id: '5', name: 'João Oliveira', role: 'agent', status: 'offline', activeChats: 0, allowedNumbers: ['wn2', 'wn3'] },
];

// ── Conversations (with numberId) ──
export const conversations: Conversation[] = [
  { id: '1', numberId: 'wn1', contact: { id: 'c1', name: 'Roberto Almeida', phone: '+55 11 99999-1234' }, lastMessage: 'Olá, preciso de ajuda com meu pedido', lastMessageTime: new Date(Date.now() - 60000 * 2), unreadCount: 3, status: 'open' },
  { id: '2', numberId: 'wn1', contact: { id: 'c2', name: 'Fernanda Souza', phone: '+55 21 98888-5678' }, lastMessage: 'Obrigada pelo suporte!', lastMessageTime: new Date(Date.now() - 60000 * 15), unreadCount: 0, status: 'active', assignedTo: '2', firstResponseTime: 45, totalTime: 900 },
  { id: '3', numberId: 'wn2', contact: { id: 'c3', name: 'Lucas Martins', phone: '+55 31 97777-9012' }, lastMessage: 'Quando chega minha encomenda?', lastMessageTime: new Date(Date.now() - 60000 * 30), unreadCount: 1, status: 'active', assignedTo: '3' },
  { id: '4', numberId: 'wn2', contact: { id: 'c4', name: 'Juliana Pereira', phone: '+55 41 96666-3456' }, lastMessage: 'Problema resolvido, obrigada!', lastMessageTime: new Date(Date.now() - 60000 * 120), unreadCount: 0, status: 'closed', assignedTo: '2', firstResponseTime: 30, totalTime: 600 },
  { id: '5', numberId: 'wn1', contact: { id: 'c5', name: 'Marcos Ribeiro', phone: '+55 51 95555-7890' }, lastMessage: 'Boa tarde, gostaria de saber sobre os planos', lastMessageTime: new Date(Date.now() - 60000 * 5), unreadCount: 2, status: 'open' },
  { id: '6', numberId: 'wn3', contact: { id: 'c6', name: 'Camila Ferreira', phone: '+55 61 94444-2345' }, lastMessage: 'Já fiz o pagamento', lastMessageTime: new Date(Date.now() - 60000 * 45), unreadCount: 0, status: 'active', assignedTo: '3', firstResponseTime: 60, totalTime: 1200 },
  { id: '7', numberId: 'wn2', contact: { id: 'c7', name: 'Rafael Nunes', phone: '+55 71 93333-4567' }, lastMessage: 'Quero fazer um orçamento', lastMessageTime: new Date(Date.now() - 60000 * 8), unreadCount: 1, status: 'open' },
  { id: '8', numberId: 'wn1', contact: { id: 'c8', name: 'Patrícia Gomes', phone: '+55 81 92222-8901' }, lastMessage: 'Meu produto veio com defeito', lastMessageTime: new Date(Date.now() - 60000 * 3), unreadCount: 4, status: 'open' },
];

export const messagesByConversation: Record<string, Message[]> = {
  '1': [
    { id: 'm1', conversationId: '1', numberId: 'wn1', content: 'Olá, boa tarde!', timestamp: new Date(Date.now() - 60000 * 10), direction: 'incoming', status: 'read' },
    { id: 'm2', conversationId: '1', numberId: 'wn1', content: 'Boa tarde! Como posso ajudar?', timestamp: new Date(Date.now() - 60000 * 9), direction: 'outgoing', status: 'read' },
    { id: 'm3', conversationId: '1', numberId: 'wn1', content: 'Preciso de ajuda com meu pedido #12345', timestamp: new Date(Date.now() - 60000 * 8), direction: 'incoming', status: 'read' },
    { id: 'm4', conversationId: '1', numberId: 'wn1', content: 'Claro! Vou verificar o status do seu pedido.', timestamp: new Date(Date.now() - 60000 * 7), direction: 'outgoing', status: 'delivered' },
    { id: 'm5', conversationId: '1', numberId: 'wn1', content: 'Olá, preciso de ajuda com meu pedido', timestamp: new Date(Date.now() - 60000 * 2), direction: 'incoming', status: 'delivered' },
  ],
  '2': [
    { id: 'm6', conversationId: '2', numberId: 'wn1', content: 'Oi, tudo bem?', timestamp: new Date(Date.now() - 60000 * 60), direction: 'incoming', status: 'read' },
    { id: 'm7', conversationId: '2', numberId: 'wn1', content: 'Tudo ótimo! Em que posso ajudar?', timestamp: new Date(Date.now() - 60000 * 59), direction: 'outgoing', status: 'read' },
    { id: 'm8', conversationId: '2', numberId: 'wn1', content: 'Quero alterar meu endereço de entrega', timestamp: new Date(Date.now() - 60000 * 58), direction: 'incoming', status: 'read' },
    { id: 'm9', conversationId: '2', numberId: 'wn1', content: 'Pronto! Endereço atualizado com sucesso.', timestamp: new Date(Date.now() - 60000 * 20), direction: 'outgoing', status: 'read' },
    { id: 'm10', conversationId: '2', numberId: 'wn1', content: 'Obrigada pelo suporte!', timestamp: new Date(Date.now() - 60000 * 15), direction: 'incoming', status: 'read' },
  ],
  '3': [
    { id: 'm11', conversationId: '3', numberId: 'wn2', content: 'Olá, comprei pelo site', timestamp: new Date(Date.now() - 60000 * 40), direction: 'incoming', status: 'read' },
    { id: 'm12', conversationId: '3', numberId: 'wn2', content: 'Quando chega minha encomenda?', timestamp: new Date(Date.now() - 60000 * 30), direction: 'incoming', status: 'delivered' },
  ],
  '5': [
    { id: 'm13', conversationId: '5', numberId: 'wn1', content: 'Boa tarde!', timestamp: new Date(Date.now() - 60000 * 8), direction: 'incoming', status: 'read' },
    { id: 'm14', conversationId: '5', numberId: 'wn1', content: 'Boa tarde, gostaria de saber sobre os planos', timestamp: new Date(Date.now() - 60000 * 5), direction: 'incoming', status: 'delivered' },
  ],
  '7': [
    { id: 'm15', conversationId: '7', numberId: 'wn2', content: 'Quero fazer um orçamento', timestamp: new Date(Date.now() - 60000 * 8), direction: 'incoming', status: 'delivered' },
  ],
  '8': [
    { id: 'm16', conversationId: '8', numberId: 'wn1', content: 'Meu produto veio com defeito', timestamp: new Date(Date.now() - 60000 * 3), direction: 'incoming', status: 'delivered' },
    { id: 'm17', conversationId: '8', numberId: 'wn1', content: 'Preciso de troca urgente', timestamp: new Date(Date.now() - 60000 * 2), direction: 'incoming', status: 'delivered' },
  ],
};

export const quickReplies = [
  'Olá! Como posso ajudar você hoje?',
  'Vou verificar isso para você. Um momento, por favor.',
  'Seu pedido está em processamento e será enviado em breve.',
  'Obrigado por entrar em contato! Posso ajudar com mais alguma coisa?',
  'Entendo sua situação. Vou encaminhar para o setor responsável.',
];

// ── Metrics per number ──
export const metricsByNumber: Record<string, {
  conversationsToday: number;
  resolvedToday: number;
  avgResponseTime: number;
  openConversations: number;
  satisfactionRate: number;
  messagesTotal: number;
}> = {
  all: { conversationsToday: 28, resolvedToday: 22, avgResponseTime: 42, openConversations: 12, satisfactionRate: 94, messagesTotal: 2340 },
  wn1: { conversationsToday: 15, resolvedToday: 12, avgResponseTime: 38, openConversations: 7, satisfactionRate: 96, messagesTotal: 1280 },
  wn2: { conversationsToday: 10, resolvedToday: 8, avgResponseTime: 45, openConversations: 4, satisfactionRate: 92, messagesTotal: 820 },
  wn3: { conversationsToday: 3, resolvedToday: 2, avgResponseTime: 55, openConversations: 1, satisfactionRate: 88, messagesTotal: 240 },
};

export const chartData = [
  { name: 'Seg', atendimentos: 32, mensagens: 245 },
  { name: 'Ter', atendimentos: 28, mensagens: 210 },
  { name: 'Qua', atendimentos: 35, mensagens: 280 },
  { name: 'Qui', atendimentos: 30, mensagens: 255 },
  { name: 'Sex', atendimentos: 38, mensagens: 310 },
  { name: 'Sáb', atendimentos: 15, mensagens: 120 },
  { name: 'Dom', atendimentos: 8, mensagens: 65 },
];

export const agentPerformance = [
  { name: 'Ana Santos', atendimentos: 45, tempoMedio: 12 },
  { name: 'Pedro Lima', atendimentos: 38, tempoMedio: 15 },
  { name: 'Carlos Silva', atendimentos: 30, tempoMedio: 10 },
  { name: 'Maria Costa', atendimentos: 25, tempoMedio: 8 },
  { name: 'João Oliveira', atendimentos: 18, tempoMedio: 20 },
];
