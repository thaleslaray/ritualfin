-- Tabela para mapeamento de merchants para categorias (auto-categorização)
CREATE TABLE public.merchant_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE,
  merchant_normalized TEXT NOT NULL,
  category TEXT NOT NULL,
  usage_count INTEGER DEFAULT 1,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(couple_id, merchant_normalized)
);

-- Índice para busca rápida por merchant normalizado
CREATE INDEX idx_merchant_mappings_merchant ON public.merchant_mappings(merchant_normalized);
CREATE INDEX idx_merchant_mappings_couple ON public.merchant_mappings(couple_id);

-- Enable RLS
ALTER TABLE public.merchant_mappings ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver mapeamentos globais OU do próprio casal
CREATE POLICY "Users can view global and own mappings" 
ON public.merchant_mappings 
FOR SELECT 
USING (is_global = true OR couple_id = get_user_couple_id(auth.uid()));

-- Política: usuários podem criar mapeamentos para o próprio casal
CREATE POLICY "Users can create own mappings" 
ON public.merchant_mappings 
FOR INSERT 
WITH CHECK (couple_id = get_user_couple_id(auth.uid()) AND is_global = false);

-- Política: usuários podem atualizar mapeamentos do próprio casal
CREATE POLICY "Users can update own mappings" 
ON public.merchant_mappings 
FOR UPDATE 
USING (couple_id = get_user_couple_id(auth.uid()) AND is_global = false);

-- Trigger para updated_at
CREATE TRIGGER update_merchant_mappings_updated_at
BEFORE UPDATE ON public.merchant_mappings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir mapeamentos globais (merchants conhecidos brasileiros)
INSERT INTO public.merchant_mappings (merchant_normalized, category, is_global, couple_id) VALUES
-- Alimentação
('ifood', 'alimentacao', true, NULL),
('rappi', 'alimentacao', true, NULL),
('uber eats', 'alimentacao', true, NULL),
('ubereats', 'alimentacao', true, NULL),
('james', 'alimentacao', true, NULL),
('zedeli', 'alimentacao', true, NULL),
('aiqfome', 'alimentacao', true, NULL),
('mcdonalds', 'alimentacao', true, NULL),
('mc donalds', 'alimentacao', true, NULL),
('burger king', 'alimentacao', true, NULL),
('bk brasil', 'alimentacao', true, NULL),
('habibs', 'alimentacao', true, NULL),
('outback', 'alimentacao', true, NULL),
('subway', 'alimentacao', true, NULL),
('giraffas', 'alimentacao', true, NULL),
('starbucks', 'alimentacao', true, NULL),
('padaria', 'alimentacao', true, NULL),
('restaurante', 'alimentacao', true, NULL),
('lanchonete', 'alimentacao', true, NULL),
('pizzaria', 'alimentacao', true, NULL),
('acai', 'alimentacao', true, NULL),
('sorvete', 'alimentacao', true, NULL),
('supermercado', 'alimentacao', true, NULL),
('mercado', 'alimentacao', true, NULL),
('carrefour', 'alimentacao', true, NULL),
('extra', 'alimentacao', true, NULL),
('pao de acucar', 'alimentacao', true, NULL),
('assai', 'alimentacao', true, NULL),
('atacadao', 'alimentacao', true, NULL),
('dia', 'alimentacao', true, NULL),
('hortifruti', 'alimentacao', true, NULL),

-- Transporte
('uber', 'transporte', true, NULL),
('99', 'transporte', true, NULL),
('99app', 'transporte', true, NULL),
('99 app', 'transporte', true, NULL),
('cabify', 'transporte', true, NULL),
('indriver', 'transporte', true, NULL),
('shell', 'transporte', true, NULL),
('ipiranga', 'transporte', true, NULL),
('br petrobras', 'transporte', true, NULL),
('petrobras', 'transporte', true, NULL),
('posto', 'transporte', true, NULL),
('combustivel', 'transporte', true, NULL),
('gasolina', 'transporte', true, NULL),
('estacionamento', 'transporte', true, NULL),
('parking', 'transporte', true, NULL),
('estapar', 'transporte', true, NULL),
('zona azul', 'transporte', true, NULL),
('pedagio', 'transporte', true, NULL),
('sem parar', 'transporte', true, NULL),
('veloe', 'transporte', true, NULL),
('conectcar', 'transporte', true, NULL),
('metro', 'transporte', true, NULL),
('bilhete unico', 'transporte', true, NULL),
('sptrans', 'transporte', true, NULL),

-- Lazer
('netflix', 'lazer', true, NULL),
('spotify', 'lazer', true, NULL),
('amazon prime', 'lazer', true, NULL),
('prime video', 'lazer', true, NULL),
('disney', 'lazer', true, NULL),
('disney+', 'lazer', true, NULL),
('hbo', 'lazer', true, NULL),
('hbo max', 'lazer', true, NULL),
('max', 'lazer', true, NULL),
('globoplay', 'lazer', true, NULL),
('paramount', 'lazer', true, NULL),
('youtube', 'lazer', true, NULL),
('youtube premium', 'lazer', true, NULL),
('apple music', 'lazer', true, NULL),
('deezer', 'lazer', true, NULL),
('tidal', 'lazer', true, NULL),
('xbox', 'lazer', true, NULL),
('playstation', 'lazer', true, NULL),
('psn', 'lazer', true, NULL),
('steam', 'lazer', true, NULL),
('nintendo', 'lazer', true, NULL),
('cinema', 'lazer', true, NULL),
('cinemark', 'lazer', true, NULL),
('cinepolis', 'lazer', true, NULL),
('uci', 'lazer', true, NULL),
('kinoplex', 'lazer', true, NULL),
('teatro', 'lazer', true, NULL),
('show', 'lazer', true, NULL),
('ingresso', 'lazer', true, NULL),
('eventim', 'lazer', true, NULL),
('sympla', 'lazer', true, NULL),

-- Saúde
('drogasil', 'saude', true, NULL),
('droga raia', 'saude', true, NULL),
('drogaraia', 'saude', true, NULL),
('farmacia', 'saude', true, NULL),
('pacheco', 'saude', true, NULL),
('pague menos', 'saude', true, NULL),
('extrafarma', 'saude', true, NULL),
('ultrafarma', 'saude', true, NULL),
('panvel', 'saude', true, NULL),
('venancio', 'saude', true, NULL),
('drogaria', 'saude', true, NULL),
('consulta', 'saude', true, NULL),
('medico', 'saude', true, NULL),
('clinica', 'saude', true, NULL),
('hospital', 'saude', true, NULL),
('laboratorio', 'saude', true, NULL),
('exame', 'saude', true, NULL),
('fleury', 'saude', true, NULL),
('lavoisier', 'saude', true, NULL),
('delboni', 'saude', true, NULL),
('unimed', 'saude', true, NULL),
('amil', 'saude', true, NULL),
('bradesco saude', 'saude', true, NULL),
('sulamerica', 'saude', true, NULL),
('dentista', 'saude', true, NULL),
('odonto', 'saude', true, NULL),
('academia', 'saude', true, NULL),
('smart fit', 'saude', true, NULL),
('smartfit', 'saude', true, NULL),
('bluefit', 'saude', true, NULL),
('gympass', 'saude', true, NULL),
('wellhub', 'saude', true, NULL),
('totalpass', 'saude', true, NULL),

-- Compras
('mercado livre', 'compras', true, NULL),
('mercadolivre', 'compras', true, NULL),
('amazon', 'compras', true, NULL),
('shopee', 'compras', true, NULL),
('aliexpress', 'compras', true, NULL),
('shein', 'compras', true, NULL),
('magalu', 'compras', true, NULL),
('magazine luiza', 'compras', true, NULL),
('americanas', 'compras', true, NULL),
('casas bahia', 'compras', true, NULL),
('ponto frio', 'compras', true, NULL),
('renner', 'compras', true, NULL),
('riachuelo', 'compras', true, NULL),
('c&a', 'compras', true, NULL),
('cea', 'compras', true, NULL),
('marisa', 'compras', true, NULL),
('zara', 'compras', true, NULL),
('centauro', 'compras', true, NULL),
('netshoes', 'compras', true, NULL),
('decathlon', 'compras', true, NULL),
('leroy merlin', 'compras', true, NULL),
('telhanorte', 'compras', true, NULL),
('tok stok', 'compras', true, NULL),
('etna', 'compras', true, NULL),
('kalunga', 'compras', true, NULL),
('saraiva', 'compras', true, NULL),
('livraria', 'compras', true, NULL),

-- Moradia (contas fixas de casa)
('light', 'moradia', true, NULL),
('enel', 'moradia', true, NULL),
('cpfl', 'moradia', true, NULL),
('cemig', 'moradia', true, NULL),
('elektro', 'moradia', true, NULL),
('celesc', 'moradia', true, NULL),
('copel', 'moradia', true, NULL),
('sabesp', 'moradia', true, NULL),
('cedae', 'moradia', true, NULL),
('copasa', 'moradia', true, NULL),
('comgas', 'moradia', true, NULL),
('gas natural', 'moradia', true, NULL),
('naturgy', 'moradia', true, NULL),
('condominio', 'moradia', true, NULL),
('aluguel', 'moradia', true, NULL),
('iptu', 'moradia', true, NULL),
('seguro residencial', 'moradia', true, NULL),
('internet', 'moradia', true, NULL),
('claro', 'moradia', true, NULL),
('vivo', 'moradia', true, NULL),
('tim', 'moradia', true, NULL),
('oi', 'moradia', true, NULL),
('net', 'moradia', true, NULL),
('sky', 'moradia', true, NULL),

-- Educação
('escola', 'educacao', true, NULL),
('colegio', 'educacao', true, NULL),
('faculdade', 'educacao', true, NULL),
('universidade', 'educacao', true, NULL),
('curso', 'educacao', true, NULL),
('udemy', 'educacao', true, NULL),
('coursera', 'educacao', true, NULL),
('alura', 'educacao', true, NULL),
('rocketseat', 'educacao', true, NULL),
('descomplica', 'educacao', true, NULL),
('duolingo', 'educacao', true, NULL),
('cultura inglesa', 'educacao', true, NULL),
('wizard', 'educacao', true, NULL),
('ccaa', 'educacao', true, NULL),
('fisk', 'educacao', true, NULL),
('livro', 'educacao', true, NULL),
('material escolar', 'educacao', true, NULL),

-- Pessoal
('salao', 'pessoal', true, NULL),
('barbearia', 'pessoal', true, NULL),
('cabeleireiro', 'pessoal', true, NULL),
('manicure', 'pessoal', true, NULL),
('estetica', 'pessoal', true, NULL),
('spa', 'pessoal', true, NULL),
('massagem', 'pessoal', true, NULL),
('perfumaria', 'pessoal', true, NULL),
('boticario', 'pessoal', true, NULL),
('natura', 'pessoal', true, NULL),
('avon', 'pessoal', true, NULL),
('sephora', 'pessoal', true, NULL),
('mac', 'pessoal', true, NULL),
('presente', 'pessoal', true, NULL);
