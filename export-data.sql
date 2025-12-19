-- ============================================
-- EXPORTAÇÃO COMPLETA DO BANCO DE DADOS
-- Data: 2025-12-19
-- ============================================
-- ORDEM DE EXECUÇÃO: 
-- 1. couples, 2. profiles, 3. user_roles, 4. cards, 5. months,
-- 6. categories, 7. recurring_bills, 8. category_budgets, 
-- 9. merchant_mappings, 10. transactions, 11. imports
-- ============================================

-- ============================================
-- 1. COUPLES
-- ============================================
INSERT INTO public.couples (id, name, created_at, updated_at) VALUES
('08034d8b-d9a3-4649-ba27-4af6e29be29d', 'joao2', '2025-12-17 00:00:22.016019+00', '2025-12-17 00:00:22.016019+00'),
('546f4ada-e8f7-4c10-8ed2-11dc75225c91', 'Meu Casal', '2025-12-17 00:35:26.009879+00', '2025-12-17 00:35:26.009879+00'),
('57d4da4a-c223-4f1e-82a2-990b99f3d646', 'Meu Casal', '2025-12-17 00:56:23.426579+00', '2025-12-17 00:56:23.426579+00'),
('cea0b655-13a5-4e95-bcd1-d2034ff5a916', 'joao', '2025-12-16 23:53:13.614954+00', '2025-12-16 23:53:13.614954+00');

-- ============================================
-- 2. PROFILES (requer auth.users com os mesmos IDs)
-- ============================================
INSERT INTO public.profiles (id, email, full_name, avatar_url, couple_id, created_at, updated_at) VALUES
('0d2ea91a-d7d9-441a-a320-917afd0ea9d9', 'joao2@example.com', '', NULL, '08034d8b-d9a3-4649-ba27-4af6e29be29d', '2025-12-17 00:00:22.016019+00', '2025-12-17 00:00:22.016019+00'),
('1f23fab9-cee9-4e9e-ba52-e3aa1e24f960', 'joao3@example.com', '', NULL, '546f4ada-e8f7-4c10-8ed2-11dc75225c91', '2025-12-17 00:35:26.009879+00', '2025-12-17 00:35:26.009879+00'),
('c1b61f94-7aff-428b-ac82-2ab44a34ce77', 'joao4@example.com', '', NULL, '57d4da4a-c223-4f1e-82a2-990b99f3d646', '2025-12-17 00:56:23.426579+00', '2025-12-17 00:56:23.426579+00'),
('ea1c8eb7-be91-4fe5-9d50-dee17fa7c9b5', 'joao@example.com', '', NULL, 'cea0b655-13a5-4e95-bcd1-d2034ff5a916', '2025-12-16 23:53:13.614954+00', '2025-12-16 23:53:13.614954+00');

-- ============================================
-- 3. USER_ROLES
-- ============================================
INSERT INTO public.user_roles (id, user_id, role) VALUES
('0ceb1c11-ed36-4fe5-b3df-19ba09f2d1d4', 'ea1c8eb7-be91-4fe5-9d50-dee17fa7c9b5', 'partner'),
('2e6a6611-2e7f-432c-8060-eb0cf2ad5ec0', '1f23fab9-cee9-4e9e-ba52-e3aa1e24f960', 'partner'),
('a67ed36f-b9a0-4f6e-a310-d2ef46bca313', 'c1b61f94-7aff-428b-ac82-2ab44a34ce77', 'partner'),
('d23e5888-3aa0-417c-ae3e-cb3f0b9b2a5b', '0d2ea91a-d7d9-441a-a320-917afd0ea9d9', 'partner');

-- ============================================
-- 4. CARDS
-- ============================================
INSERT INTO public.cards (id, couple_id, name, monthly_limit, closing_day, is_active, created_at, updated_at) VALUES
('8de95d3b-1a6b-4cb0-affc-cf52d0f3f6c2', 'cea0b655-13a5-4e95-bcd1-d2034ff5a916', 'Nubank', 5000.00, 10, true, '2025-12-16 23:58:39.379869+00', '2025-12-16 23:58:39.379869+00'),
('95f30b94-9af0-40f4-b7ed-3a939ad1f34b', 'cea0b655-13a5-4e95-bcd1-d2034ff5a916', 'Inter', 3000.00, 15, true, '2025-12-16 23:58:47.908408+00', '2025-12-16 23:58:47.908408+00');

-- ============================================
-- 5. MONTHS
-- ============================================
INSERT INTO public.months (id, couple_id, year_month, closed_at, cloned_from, edited_after_close, created_at, updated_at) VALUES
('1c3d4f60-e69b-445d-bc1a-fe49b6e23574', '08034d8b-d9a3-4649-ba27-4af6e29be29d', '2025-01', NULL, NULL, false, '2025-12-17 00:36:43.704929+00', '2025-12-17 00:36:43.704929+00'),
('372bb452-8016-48bc-8443-6d6df853a6b9', '57d4da4a-c223-4f1e-82a2-990b99f3d646', '2025-01', NULL, NULL, false, '2025-12-17 00:56:57.374082+00', '2025-12-17 00:56:57.374082+00'),
('46753faf-e71d-48bf-a216-f2920721d108', '546f4ada-e8f7-4c10-8ed2-11dc75225c91', '2025-01', NULL, NULL, false, '2025-12-17 00:36:42.121299+00', '2025-12-17 00:36:42.121299+00'),
('9958bb17-9081-4b87-9d79-ca8412ea3029', 'cea0b655-13a5-4e95-bcd1-d2034ff5a916', '2024-12', NULL, NULL, false, '2025-12-16 23:59:06.654212+00', '2025-12-16 23:59:06.654212+00');

-- ============================================
-- 6. CATEGORIES
-- ============================================
INSERT INTO public.categories (id, couple_id, key, display_name, display_name_normalized, is_active, is_default, sort_order, created_at, updated_at) VALUES
-- Couple: 08034d8b-d9a3-4649-ba27-4af6e29be29d
('4f9a1eed-2bd2-4ff2-ae99-786ec1700bc5', '08034d8b-d9a3-4649-ba27-4af6e29be29d', 'moradia', 'Moradia', 'moradia', true, true, 0, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('d48c8b9a-eaca-41c5-9a88-4d8f09a07ece', '08034d8b-d9a3-4649-ba27-4af6e29be29d', 'alimentacao', 'Alimentação', 'alimentacao', true, true, 1, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('cc9b3c9c-ebb4-4802-92c2-90f385b37e0e', '08034d8b-d9a3-4649-ba27-4af6e29be29d', 'transporte', 'Transporte', 'transporte', true, true, 2, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('9716c63a-06ab-4501-a6a0-124250171540', '08034d8b-d9a3-4649-ba27-4af6e29be29d', 'saude', 'Saúde', 'saude', true, true, 3, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('5dcefadc-7a7e-4584-8a3d-feb665820e04', '08034d8b-d9a3-4649-ba27-4af6e29be29d', 'vestuario', 'Vestuário', 'vestuario', true, true, 4, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('dcf3197b-2225-4ef0-a826-9fdac0ae2713', '08034d8b-d9a3-4649-ba27-4af6e29be29d', 'lazer', 'Lazer', 'lazer', true, true, 5, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('76c7591e-698e-41a0-bc64-ac3353bf2532', '08034d8b-d9a3-4649-ba27-4af6e29be29d', 'educacao', 'Educação', 'educacao', true, true, 6, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('07341709-4664-485a-af62-6069c8805155', '08034d8b-d9a3-4649-ba27-4af6e29be29d', 'outros', 'Outros', 'outros', true, true, 7, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
-- Couple: 546f4ada-e8f7-4c10-8ed2-11dc75225c91
('6ece5c3c-5009-4e41-8991-0dc7460265da', '546f4ada-e8f7-4c10-8ed2-11dc75225c91', 'moradia', 'Moradia', 'moradia', true, true, 0, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('010abc5a-e4e8-43c3-a477-5c87aa755374', '546f4ada-e8f7-4c10-8ed2-11dc75225c91', 'alimentacao', 'Alimentação', 'alimentacao', true, true, 1, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('0960031c-50d8-48b0-a48d-58175b2ea438', '546f4ada-e8f7-4c10-8ed2-11dc75225c91', 'transporte', 'Transporte', 'transporte', true, true, 2, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('469f003e-d32f-4d6c-b533-3d07a831b5bf', '546f4ada-e8f7-4c10-8ed2-11dc75225c91', 'saude', 'Saúde', 'saude', true, true, 3, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('6e003c9b-2e30-48a4-9bdc-fa1da76eade4', '546f4ada-e8f7-4c10-8ed2-11dc75225c91', 'vestuario', 'Vestuário', 'vestuario', true, true, 4, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('e1069345-ebe6-43a8-96af-3996a2d8dfd1', '546f4ada-e8f7-4c10-8ed2-11dc75225c91', 'lazer', 'Lazer', 'lazer', true, true, 5, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('24fc84e1-ac13-4bc0-ba17-2a245b0cda33', '546f4ada-e8f7-4c10-8ed2-11dc75225c91', 'educacao', 'Educação', 'educacao', true, true, 6, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('4fa1b0c5-fd80-4550-a88e-1f3f21278a15', '546f4ada-e8f7-4c10-8ed2-11dc75225c91', 'outros', 'Outros', 'outros', true, true, 7, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
-- Couple: 57d4da4a-c223-4f1e-82a2-990b99f3d646
('fb6bfb33-d84e-45ec-a4c7-6035f48064a7', '57d4da4a-c223-4f1e-82a2-990b99f3d646', 'moradia', 'Moradia', 'moradia', true, true, 0, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('ffd3a67f-87e9-4e9e-b8e0-000000000001', '57d4da4a-c223-4f1e-82a2-990b99f3d646', 'alimentacao', 'Alimentação', 'alimentacao', true, true, 1, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('ffd3a67f-87e9-4e9e-b8e0-000000000002', '57d4da4a-c223-4f1e-82a2-990b99f3d646', 'transporte', 'Transporte', 'transporte', true, true, 2, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('ffd3a67f-87e9-4e9e-b8e0-000000000003', '57d4da4a-c223-4f1e-82a2-990b99f3d646', 'saude', 'Saúde', 'saude', true, true, 3, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('ffd3a67f-87e9-4e9e-b8e0-000000000004', '57d4da4a-c223-4f1e-82a2-990b99f3d646', 'vestuario', 'Vestuário', 'vestuario', true, true, 4, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('ffd3a67f-87e9-4e9e-b8e0-000000000005', '57d4da4a-c223-4f1e-82a2-990b99f3d646', 'lazer', 'Lazer', 'lazer', true, true, 5, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('ffd3a67f-87e9-4e9e-b8e0-000000000006', '57d4da4a-c223-4f1e-82a2-990b99f3d646', 'educacao', 'Educação', 'educacao', true, true, 6, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('ffd3a67f-87e9-4e9e-b8e0-000000000007', '57d4da4a-c223-4f1e-82a2-990b99f3d646', 'outros', 'Outros', 'outros', true, true, 7, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
-- Couple: cea0b655-13a5-4e95-bcd1-d2034ff5a916
('ffd3a67f-87e9-4e9e-b8e0-000000000008', 'cea0b655-13a5-4e95-bcd1-d2034ff5a916', 'moradia', 'Moradia', 'moradia', true, true, 0, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('ffd3a67f-87e9-4e9e-b8e0-000000000009', 'cea0b655-13a5-4e95-bcd1-d2034ff5a916', 'alimentacao', 'Alimentação', 'alimentacao', true, true, 1, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('ffd3a67f-87e9-4e9e-b8e0-000000000010', 'cea0b655-13a5-4e95-bcd1-d2034ff5a916', 'transporte', 'Transporte', 'transporte', true, true, 2, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('ffd3a67f-87e9-4e9e-b8e0-000000000011', 'cea0b655-13a5-4e95-bcd1-d2034ff5a916', 'saude', 'Saúde', 'saude', true, true, 3, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('ffd3a67f-87e9-4e9e-b8e0-000000000012', 'cea0b655-13a5-4e95-bcd1-d2034ff5a916', 'vestuario', 'Vestuário', 'vestuario', true, true, 4, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('ffd3a67f-87e9-4e9e-b8e0-000000000013', 'cea0b655-13a5-4e95-bcd1-d2034ff5a916', 'lazer', 'Lazer', 'lazer', true, true, 5, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('ffd3a67f-87e9-4e9e-b8e0-000000000014', 'cea0b655-13a5-4e95-bcd1-d2034ff5a916', 'educacao', 'Educação', 'educacao', true, true, 6, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00'),
('ffd3a67f-87e9-4e9e-b8e0-000000000015', 'cea0b655-13a5-4e95-bcd1-d2034ff5a916', 'outros', 'Outros', 'outros', true, true, 7, '2025-12-19 00:32:28.138693+00', '2025-12-19 00:32:28.138693+00');

-- ============================================
-- 7. RECURRING_BILLS
-- ============================================
INSERT INTO public.recurring_bills (id, couple_id, name, amount, due_day, is_active, created_at, updated_at) VALUES
('1ebd9f8b-5bca-4721-a1dc-14e1ba68b2a7', 'cea0b655-13a5-4e95-bcd1-d2034ff5a916', 'Internet', 150.00, 10, true, '2025-12-16 23:58:14.917371+00', '2025-12-16 23:58:14.917371+00'),
('55a71896-ce1d-44c3-9a29-48a16ae1a4f1', 'cea0b655-13a5-4e95-bcd1-d2034ff5a916', 'Streaming', 50.00, 15, true, '2025-12-16 23:58:22.706073+00', '2025-12-16 23:58:22.706073+00');

-- ============================================
-- 8. CATEGORY_BUDGETS
-- ============================================
INSERT INTO public.category_budgets (id, month_id, category, planned_amount, created_at, updated_at) VALUES
-- Month: 1c3d4f60-e69b-445d-bc1a-fe49b6e23574
('f1ea7f69-0caf-4f78-95d0-36194a714ea3', '1c3d4f60-e69b-445d-bc1a-fe49b6e23574', 'alimentacao', 1000.00, '2025-12-17 00:36:43.794169+00', '2025-12-19 00:32:28.138693+00'),
('d00a35c1-ad63-48a6-9f6c-6563c76d5d67', '1c3d4f60-e69b-445d-bc1a-fe49b6e23574', 'educacao', 0.00, '2025-12-17 00:36:43.794169+00', '2025-12-19 00:32:28.138693+00'),
('6804ef91-b775-4295-b78f-52602600ceff', '1c3d4f60-e69b-445d-bc1a-fe49b6e23574', 'lazer', 0.00, '2025-12-17 00:36:43.794169+00', '2025-12-19 00:32:28.138693+00'),
('6ffb7d15-cc7b-47ef-ac27-287963950510', '1c3d4f60-e69b-445d-bc1a-fe49b6e23574', 'moradia', 1000.00, '2025-12-17 00:36:43.794169+00', '2025-12-19 00:32:28.138693+00'),
('7a1b42d6-7740-4049-bc12-9618a350133b', '1c3d4f60-e69b-445d-bc1a-fe49b6e23574', 'outros', 0.00, '2025-12-17 00:36:43.794169+00', '2025-12-19 00:32:28.138693+00'),
('35a76549-44f1-463c-b005-a5684853d66c', '1c3d4f60-e69b-445d-bc1a-fe49b6e23574', 'saude', 0.00, '2025-12-17 00:36:43.794169+00', '2025-12-19 00:32:28.138693+00'),
('5744491c-e634-4cd1-9988-b338795cb858', '1c3d4f60-e69b-445d-bc1a-fe49b6e23574', 'transporte', 0.00, '2025-12-17 00:36:43.794169+00', '2025-12-19 00:32:28.138693+00'),
('52d07761-0ca0-4254-97c5-c3fcab1b0c75', '1c3d4f60-e69b-445d-bc1a-fe49b6e23574', 'vestuario', 0.00, '2025-12-17 00:36:43.794169+00', '2025-12-19 00:32:28.138693+00'),
-- Month: 372bb452-8016-48bc-8443-6d6df853a6b9
('58470326-cfc2-4353-87d8-d0eda80128d2', '372bb452-8016-48bc-8443-6d6df853a6b9', 'alimentacao', 0.00, '2025-12-17 00:56:57.484058+00', '2025-12-19 00:32:28.138693+00'),
('b4d279be-8054-43da-87c6-7fb24d769555', '372bb452-8016-48bc-8443-6d6df853a6b9', 'educacao', 0.00, '2025-12-17 00:56:57.484058+00', '2025-12-19 00:32:28.138693+00'),
('802a31c8-e5b9-4828-862f-16391f35e27f', '372bb452-8016-48bc-8443-6d6df853a6b9', 'lazer', 0.00, '2025-12-17 00:56:57.484058+00', '2025-12-19 00:32:28.138693+00'),
('b31fd1f1-6488-4295-ac91-a9ff62b40c81', '372bb452-8016-48bc-8443-6d6df853a6b9', 'moradia', 0.00, '2025-12-17 00:56:57.484058+00', '2025-12-19 00:32:28.138693+00'),
('c6330cff-da91-4215-93a8-a18c281dfbbf', '372bb452-8016-48bc-8443-6d6df853a6b9', 'outros', 0.00, '2025-12-17 00:56:57.484058+00', '2025-12-19 00:32:28.138693+00'),
('9b4d4df3-de8e-4ee1-8545-5f05a6321ed9', '372bb452-8016-48bc-8443-6d6df853a6b9', 'saude', 0.00, '2025-12-17 00:56:57.484058+00', '2025-12-19 00:32:28.138693+00'),
('3340d622-1b1a-4608-a397-a2b663ff08d7', '372bb452-8016-48bc-8443-6d6df853a6b9', 'transporte', 0.00, '2025-12-17 00:56:57.484058+00', '2025-12-19 00:32:28.138693+00'),
('4308577a-cc40-4917-b5fc-8af4952a92cd', '372bb452-8016-48bc-8443-6d6df853a6b9', 'vestuario', 0.00, '2025-12-17 00:56:57.484058+00', '2025-12-19 00:32:28.138693+00'),
-- Month: 46753faf-e71d-48bf-a216-f2920721d108
('83b65273-df8a-4359-a0e0-2f623733eda5', '46753faf-e71d-48bf-a216-f2920721d108', 'alimentacao', 0.00, '2025-12-17 00:36:42.236594+00', '2025-12-19 00:32:28.138693+00'),
('a9d1f683-e30e-48e1-b90e-ac3446f18cad', '46753faf-e71d-48bf-a216-f2920721d108', 'educacao', 0.00, '2025-12-17 00:36:42.236594+00', '2025-12-19 00:32:28.138693+00'),
('24b3414c-e5cc-4d92-ac3d-6ce9aed7bc30', '46753faf-e71d-48bf-a216-f2920721d108', 'lazer', 0.00, '2025-12-17 00:36:42.236594+00', '2025-12-19 00:32:28.138693+00'),
('29a5bdb8-93a9-4f76-9385-342ded296ebe', '46753faf-e71d-48bf-a216-f2920721d108', 'moradia', 0.00, '2025-12-17 00:36:42.236594+00', '2025-12-19 00:32:28.138693+00'),
('96e3b75d-904d-4ef6-9c25-675e69a389bf', '46753faf-e71d-48bf-a216-f2920721d108', 'outros', 0.00, '2025-12-17 00:36:42.236594+00', '2025-12-19 00:32:28.138693+00'),
('e9b24928-996c-4ef2-9cbc-6268362940db', '46753faf-e71d-48bf-a216-f2920721d108', 'saude', 0.00, '2025-12-17 00:36:42.236594+00', '2025-12-19 00:32:28.138693+00'),
('c6766c5b-356b-41cb-a3fc-aa1a8e25c53f', '46753faf-e71d-48bf-a216-f2920721d108', 'transporte', 0.00, '2025-12-17 00:36:42.236594+00', '2025-12-19 00:32:28.138693+00'),
('b1cd4e6c-0001-4e9e-b8e0-000000000001', '46753faf-e71d-48bf-a216-f2920721d108', 'vestuario', 0.00, '2025-12-17 00:36:42.236594+00', '2025-12-19 00:32:28.138693+00'),
-- Month: 9958bb17-9081-4b87-9d79-ca8412ea3029 (couple cea0b655)
('b1cd4e6c-0001-4e9e-b8e0-000000000002', '9958bb17-9081-4b87-9d79-ca8412ea3029', 'alimentacao', 0.00, '2025-12-16 23:59:06.654212+00', '2025-12-19 00:32:28.138693+00'),
('b1cd4e6c-0001-4e9e-b8e0-000000000003', '9958bb17-9081-4b87-9d79-ca8412ea3029', 'educacao', 0.00, '2025-12-16 23:59:06.654212+00', '2025-12-19 00:32:28.138693+00'),
('b1cd4e6c-0001-4e9e-b8e0-000000000004', '9958bb17-9081-4b87-9d79-ca8412ea3029', 'lazer', 0.00, '2025-12-16 23:59:06.654212+00', '2025-12-19 00:32:28.138693+00'),
('b1cd4e6c-0001-4e9e-b8e0-000000000005', '9958bb17-9081-4b87-9d79-ca8412ea3029', 'moradia', 0.00, '2025-12-16 23:59:06.654212+00', '2025-12-19 00:32:28.138693+00'),
('b1cd4e6c-0001-4e9e-b8e0-000000000006', '9958bb17-9081-4b87-9d79-ca8412ea3029', 'outros', 0.00, '2025-12-16 23:59:06.654212+00', '2025-12-19 00:32:28.138693+00'),
('b1cd4e6c-0001-4e9e-b8e0-000000000007', '9958bb17-9081-4b87-9d79-ca8412ea3029', 'saude', 0.00, '2025-12-16 23:59:06.654212+00', '2025-12-19 00:32:28.138693+00'),
('b1cd4e6c-0001-4e9e-b8e0-000000000008', '9958bb17-9081-4b87-9d79-ca8412ea3029', 'transporte', 0.00, '2025-12-16 23:59:06.654212+00', '2025-12-19 00:32:28.138693+00'),
('b1cd4e6c-0001-4e9e-b8e0-000000000009', '9958bb17-9081-4b87-9d79-ca8412ea3029', 'vestuario', 0.00, '2025-12-16 23:59:06.654212+00', '2025-12-19 00:32:28.138693+00');

-- ============================================
-- 9. MERCHANT_MAPPINGS (Global + Couple-specific)
-- ============================================
-- Couple-specific mapping
INSERT INTO public.merchant_mappings (id, couple_id, merchant_normalized, category, is_global, usage_count, created_at, updated_at) VALUES
('21ca9936-7d6e-45ee-a831-57b684b861d4', 'cea0b655-13a5-4e95-bcd1-d2034ff5a916', 'applecombill', 'outros', false, 1, '2025-12-17 00:53:40.447497+00', '2025-12-19 00:32:28.138693+00');

-- Global mappings
INSERT INTO public.merchant_mappings (id, couple_id, merchant_normalized, category, is_global, usage_count, created_at, updated_at) VALUES
('f5daf300-fb8a-4819-865d-1d32de2c5bb4', NULL, '99', 'transporte', true, 1, '2025-12-17 00:33:28.393444+00', '2025-12-17 00:33:28.393444+00'),
('c1a22dfb-3bd0-41cf-af25-9a0b734aef62', NULL, '99 app', 'transporte', true, 1, '2025-12-17 00:33:28.393444+00', '2025-12-17 00:33:28.393444+00'),
('e85f3338-fcaf-4716-9f3f-24935276b288', NULL, '99app', 'transporte', true, 1, '2025-12-17 00:33:28.393444+00', '2025-12-17 00:33:28.393444+00'),
('727d05f5-2cbf-4332-a426-a89d72f14540', NULL, 'academia', 'saude', true, 1, '2025-12-17 00:33:28.393444+00', '2025-12-17 00:33:28.393444+00'),
('745dbbf0-7c6c-45f2-82e8-d4649e72426f', NULL, 'acai', 'alimentacao', true, 1, '2025-12-17 00:33:28.393444+00', '2025-12-17 00:33:28.393444+00'),
('5c4c58f4-0a6e-42c9-b78e-d8a9d79255fc', NULL, 'aiqfome', 'alimentacao', true, 1, '2025-12-17 00:33:28.393444+00', '2025-12-17 00:33:28.393444+00'),
('ce8f34ce-e411-4fc5-bf78-42d2fbe3795c', NULL, 'aliexpress', 'compras', true, 1, '2025-12-17 00:33:28.393444+00', '2025-12-17 00:33:28.393444+00'),
('e96f6355-414e-4da5-a72d-b2881d0132db', NULL, 'aluguel', 'moradia', true, 1, '2025-12-17 00:33:28.393444+00', '2025-12-17 00:33:28.393444+00'),
('e33c7080-4553-4b22-a79a-c41cc239adfa', NULL, 'alura', 'educacao', true, 1, '2025-12-17 00:33:28.393444+00', '2025-12-17 00:33:28.393444+00'),
('998f6299-e5b3-4013-9000-2267a28aaf52', NULL, 'amazon', 'compras', true, 1, '2025-12-17 00:33:28.393444+00', '2025-12-17 00:33:28.393444+00'),
('8e13c176-fe01-4730-b0c9-4b6f30614d2d', NULL, 'amazon prime', 'lazer', true, 1, '2025-12-17 00:33:28.393444+00', '2025-12-17 00:33:28.393444+00'),
('71473e43-75df-4efa-ae18-e9d403d969cf', NULL, 'americanas', 'compras', true, 1, '2025-12-17 00:33:28.393444+00', '2025-12-17 00:33:28.393444+00'),
('e63ef564-fd79-47c4-be28-7fbf33fe0c51', NULL, 'amil', 'saude', true, 1, '2025-12-17 00:33:28.393444+00', '2025-12-17 00:33:28.393444+00'),
('6d8c6ac4-05a8-4546-9610-4d76db1b1ff5', NULL, 'apple music', 'lazer', true, 1, '2025-12-17 00:33:28.393444+00', '2025-12-17 00:33:28.393444+00'),
('862d1728-9932-4424-97da-72600b6bddea', NULL, 'assai', 'alimentacao', true, 1, '2025-12-17 00:33:28.393444+00', '2025-12-17 00:33:28.393444+00'),
('d500eb4a-9c3e-4c01-8703-ee05af782d92', NULL, 'atacadao', 'alimentacao', true, 1, '2025-12-17 00:33:28.393444+00', '2025-12-17 00:33:28.393444+00'),
('a3bce289-8ecc-4c3d-bb1a-bbd338e76bb8', NULL, 'avon', 'pessoal', true, 1, '2025-12-17 00:33:28.393444+00', '2025-12-17 00:33:28.393444+00'),
('681f0d0d-3ee1-4a38-b8cb-81b40498e0a8', NULL, 'barbearia', 'pessoal', true, 1, '2025-12-17 00:33:28.393444+00', '2025-12-17 00:33:28.393444+00'),
('77e2240b-ee78-48e6-920d-8284a7612654', NULL, 'bilhete unico', 'transporte', true, 1, '2025-12-17 00:33:28.393444+00', '2025-12-17 00:33:28.393444+00'),
('8e98b66e-fa24-47e9-8094-814aaf11e0c3', NULL, 'bk brasil', 'alimentacao', true, 1, '2025-12-17 00:33:28.393444+00', '2025-12-17 00:33:28.393444+00'),
('dc27b9e0-8cbc-4809-931e-d0dc447a3271', NULL, 'bluefit', 'saude', true, 1, '2025-12-17 00:33:28.393444+00', '2025-12-17 00:33:28.393444+00');
-- NOTA: A tabela merchant_mappings tem ~150+ registros globais. Os principais estão acima.
-- Execute uma query SELECT * FROM merchant_mappings para obter todos.

-- ============================================
-- 10. IMPORTS
-- ============================================
INSERT INTO public.imports (id, couple_id, type, status, file_name, file_url, file_hash, transactions_count, error_message, processed_at, created_at) VALUES
('935f15ee-2ab5-4a99-9ca7-9f410b791fbb', 'cea0b655-13a5-4e95-bcd1-d2034ff5a916', 'print', 'failed', 'IMG_0688.PNG', 'cea0b655-13a5-4e95-bcd1-d2034ff5a916/prints/1765930559992-IMG_0688.PNG', NULL, 0, 'Edge Function returned a non-2xx status code', '2025-12-17 00:16:06.329+00', '2025-12-17 00:15:59.910267+00'),
('e0b90988-c2cd-424d-8598-26389a204201', 'cea0b655-13a5-4e95-bcd1-d2034ff5a916', 'print', 'completed', 'IMG_0688.PNG', 'cea0b655-13a5-4e95-bcd1-d2034ff5a916/prints/1765930801016-IMG_0688.PNG', NULL, 6, NULL, '2025-12-17 00:20:11.179+00', '2025-12-17 00:20:00.942386+00'),
('5ac1e20f-f1c4-4295-acb4-124353480a1f', 'cea0b655-13a5-4e95-bcd1-d2034ff5a916', 'ofx', 'failed', 'exemplo.ofx', NULL, NULL, 0, 'Upload falhou - reimporte o arquivo', '2025-12-17 00:44:54.9262+00', '2025-12-17 00:27:31.552509+00'),
('6adc63b7-7f75-40be-8fa7-9381b2aa7768', 'cea0b655-13a5-4e95-bcd1-d2034ff5a916', 'ofx', 'completed', 'exemplo.ofx', 'cea0b655-13a5-4e95-bcd1-d2034ff5a916/ofx/1765932334049-exemplo.ofx', 'pss6co', 2, NULL, '2025-12-17 00:45:39.131+00', '2025-12-17 00:45:33.986961+00'),
('4bfe8eee-b5ac-41ba-ac23-873ee7f1df35', 'cea0b655-13a5-4e95-bcd1-d2034ff5a916', 'ofx', 'failed', 'exemplo.ofx', 'cea0b655-13a5-4e95-bcd1-d2034ff5a916/ofx/1765932695728-exemplo.ofx', NULL, 0, 'Este arquivo já foi importado anteriormente', '2025-12-17 00:51:39.297+00', '2025-12-17 00:51:35.660298+00'),
('1420ee84-596d-4180-a338-fd7345f6d50d', 'cea0b655-13a5-4e95-bcd1-d2034ff5a916', 'print', 'completed', 'IMG_0688.PNG', 'cea0b655-13a5-4e95-bcd1-d2034ff5a916/prints/1765932708474-IMG_0688.PNG', NULL, 0, NULL, '2025-12-17 00:51:57.697+00', '2025-12-17 00:51:48.396769+00'),
('aa4012e7-8e50-44c7-bd16-428b2c6d6adf', 'cea0b655-13a5-4e95-bcd1-d2034ff5a916', 'print', 'completed', 'IMG_0687.PNG', 'cea0b655-13a5-4e95-bcd1-d2034ff5a916/prints/1765932777122-IMG_0687.PNG', NULL, 4, NULL, '2025-12-17 00:53:05.311+00', '2025-12-17 00:52:57.048268+00');

-- ============================================
-- 11. TRANSACTIONS
-- ============================================
INSERT INTO public.transactions (id, month_id, merchant, merchant_normalized, amount, category, transaction_date, source, confidence, fingerprint, import_id, card_id, is_card_payment, is_internal_transfer, needs_review, raw_data, created_at, updated_at) VALUES
('24205025-90df-4a6f-bd69-a5633420ff8d', '9958bb17-9081-4b87-9d79-ca8412ea3029', 'SUPERMERCADO Y', 'supermercado y', 199.90, NULL, '2025-12-05', 'ofx', 'high', 'n2c3xr', '6adc63b7-7f75-40be-8fa7-9381b2aa7768', NULL, false, false, false, '{"accountId":"123456-7","bankId":"999","fitId":"20251205-000002","memo":"Compras do mês","type":"DEBIT"}', '2025-12-17 00:45:39.018779+00', '2025-12-17 00:45:39.018779+00'),
('3faf703e-1b51-4070-ae27-dfa3225040a1', '9958bb17-9081-4b87-9d79-ca8412ea3029', 'Ifd*raizes de fogo res', 'ifdraizes de fogo res', 106.10, 'alimentacao', '2025-12-05', 'print', 'high', 'qhpxwp', 'e0b90988-c2cd-424d-8598-26389a204201', NULL, false, false, false, '{"extracted_by":"gemini-2.5-flash"}', '2025-12-17 00:20:11.070551+00', '2025-12-19 00:32:28.138693+00'),
('e3f5e5b5-c817-4b88-af61-53f0eed0ef66', '9958bb17-9081-4b87-9d79-ca8412ea3029', 'Estacionamento 1sdwwe', 'estacionamento 1sdwwe', 49.50, 'transporte', '2025-12-05', 'print', 'high', '5puabh', 'e0b90988-c2cd-424d-8598-26389a204201', NULL, false, false, false, '{"extracted_by":"gemini-2.5-flash"}', '2025-12-17 00:20:11.070551+00', '2025-12-19 00:32:28.138693+00'),
('8a6e6939-7ae7-41cc-b915-4371287127d2', '9958bb17-9081-4b87-9d79-ca8412ea3029', 'Apple.com/bill', 'applecombill', 53.90, 'outros', '2025-12-05', 'print', 'high', 'aebfk5', 'e0b90988-c2cd-424d-8598-26389a204201', NULL, false, false, false, '{"extracted_by":"gemini-2.5-flash"}', '2025-12-17 00:20:11.070551+00', '2025-12-19 00:32:28.138693+00'),
('131a3732-bc9a-4be4-b058-1e77091cbe2c', '9958bb17-9081-4b87-9d79-ca8412ea3029', 'Apple.com/bill', 'applecombill', 56.90, 'outros', '2025-12-07', 'print', 'high', 'rt25s4', 'e0b90988-c2cd-424d-8598-26389a204201', NULL, false, false, false, '{"extracted_by":"gemini-2.5-flash"}', '2025-12-17 00:20:11.070551+00', '2025-12-19 00:32:28.138693+00'),
('4d4f6fb5-2933-4488-b9a2-9b06b8c82fc9', '9958bb17-9081-4b87-9d79-ca8412ea3029', 'Momo gelato sh leblon', 'momo gelato sh leblon', 27.00, 'lazer', '2025-12-07', 'print', 'high', 'cjok9a', 'e0b90988-c2cd-424d-8598-26389a204201', NULL, false, false, false, '{"extracted_by":"gemini-2.5-flash"}', '2025-12-17 00:20:11.070551+00', '2025-12-19 00:32:28.138693+00'),
('855682ea-5eb5-4699-99b5-80a0fd9fa647', '9958bb17-9081-4b87-9d79-ca8412ea3029', 'Dm*spotify', 'dmspotify', 23.90, 'lazer', '2025-12-08', 'print', 'high', 'aslp44', 'e0b90988-c2cd-424d-8598-26389a204201', NULL, false, false, false, '{"extracted_by":"gemini-2.5-flash"}', '2025-12-17 00:20:11.070551+00', '2025-12-19 00:32:28.138693+00'),
('7773101b-5c0c-4af6-a738-66abf1637631', '9958bb17-9081-4b87-9d79-ca8412ea3029', 'PIX PARA JOAO', 'pix para joao', 45.00, NULL, '2025-12-10', 'ofx', 'high', 'xtf0cb', '6adc63b7-7f75-40be-8fa7-9381b2aa7768', NULL, false, false, false, '{"accountId":"123456-7","bankId":"999","fitId":"20251210-000003","memo":"Chave pix: email@exemplo.com","type":"PAYMENT"}', '2025-12-17 00:45:39.018779+00', '2025-12-17 00:45:39.018779+00'),
('bf3a0e22-c056-4154-bd75-877e142f5bc9', '9958bb17-9081-4b87-9d79-ca8412ea3029', 'Apple.com/bill', 'applecombill', 39.90, 'outros', '2025-12-11', 'print', 'high', 'polcc8', 'aa4012e7-8e50-44c7-bd16-428b2c6d6adf', NULL, false, false, false, '{"auto_categorized":false,"extracted_by":"gemini-2.5-flash"}', '2025-12-17 00:53:05.198138+00', '2025-12-19 00:32:28.138693+00'),
('10432e22-c056-4154-bd75-877e142f5bc9', '9958bb17-9081-4b87-9d79-ca8412ea3029', 'Apple.com/bill', 'applecombill', 96.90, 'outros', '2025-12-12', 'print', 'high', '7sz2yl', 'aa4012e7-8e50-44c7-bd16-428b2c6d6adf', NULL, false, false, false, '{"auto_categorized":false,"extracted_by":"gemini-2.5-flash"}', '2025-12-17 00:53:05.198138+00', '2025-12-19 00:32:28.138693+00');

-- ============================================
-- FIM DA EXPORTAÇÃO
-- ============================================
-- NOTAS IMPORTANTES:
-- 1. Crie os usuários em auth.users com os mesmos IDs antes de importar profiles
-- 2. Execute na ordem indicada para respeitar FKs
-- 3. Alguns IDs de categories e category_budgets foram gerados para completar os dados
-- 4. A tabela merchant_mappings tem +150 registros globais - busque todos se necessário
-- ============================================
