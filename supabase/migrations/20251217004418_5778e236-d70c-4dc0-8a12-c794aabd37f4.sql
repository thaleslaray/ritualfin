-- Adicionar MIME types alternativos para arquivos OFX
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'image/png', 'image/jpeg', 'image/webp', 'image/heic',
  'application/x-ofx', 'text/plain', 
  'application/octet-stream', 'application/vnd.intu.qbo'
]
WHERE name = 'uploads';