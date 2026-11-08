-- Gulit Online live data (from the 2026-11-07 01:02 export), DATA ONLY.
-- PRIVATE: contains customer names/phones and password/access-code hashes. Do not publish.
-- Use on a NEW database AFTER: wrangler d1 migrations apply DB --remote   (creates all tables, 0000–0011)
-- Then: wrangler d1 execute DB --remote --file gulit_live_data_import.sql
-- Left out on purpose: admin_attempts (old rate-limit counters).

-- admin_credentials: 1
INSERT OR IGNORE INTO "admin_credentials" ("id","username","salt","password_hash") VALUES (1,'hamza','263968ed14dd75ca8475dc92cb156312bdeba9e4a27862326f56a0ed0b65ee1f','9dd1d423916fd9aee5e3eb9ec5a7f589696e34bbf844df4338c44b085a1bdbba');

-- admin_sessions: 2
INSERT OR IGNORE INTO "admin_sessions" ("token_hash","expires") VALUES ('29e4c60ee4bfd3faf31ddcdd9a22bc5a3cb4244c1fd57a7942bd6980fc13b516',1794028179218);
INSERT OR IGNORE INTO "admin_sessions" ("token_hash","expires") VALUES ('faddf321f02195feb4246613a03f2a7271e8968399a9398046d2b9557abdca9b',1794028370571);

-- products: 1
INSERT OR IGNORE INTO "products" ("id","name","category","price_cents","stock","image","archived","revision","updated_by","updated_at","manufacturing_date","expiry_date") VALUES (1,'Wireless over-ear headphones','Electronics',2800000,25,'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=700&q=80',0,1,'r7NM3EKAr787ky5Gs8YScoe0BevMHCxEGh1vvGOEgpDXF4SSpM6gRb','2026-10-31T21:20:06.802Z',NULL,NULL);

-- drivers: 2
INSERT OR IGNORE INTO "drivers" ("id","name","username","code_hash","active") VALUES ('cb98a1e1-394e-45ca-ae97-5451babc2fde','Nuraddis','8080','1b18e9141b25cfce70aafb91418c127cffc5e937d60d9eee97dacc3fceeb9392',1);
INSERT OR IGNORE INTO "drivers" ("id","name","username","code_hash","active") VALUES ('f8868899-c165-47ec-b86b-823cf4ecef93','Musse','8081','b82325221ca4ebe2263ebe74d9a6795cac5fa4968947152acf2a6d6e96bac708',1);

-- driver_sessions: 1
INSERT OR IGNORE INTO "driver_sessions" ("token_hash","driver_id","expires") VALUES ('ce5b3f596942eef888d549572fe8c0f63c861fc97f129fc5202a0055221008a3','f8868899-c165-47ec-b86b-823cf4ecef93',1793576676233);

-- engineers: 1
INSERT OR IGNORE INTO "engineers" ("id","name","username","code_hash","skills","active","available","location","location_at") VALUES ('2276c8cb-2454-4de1-8d63-43f536f9f8b6','Delil','000001','c66e55fb8ef66bf7a0fae9ba7ab1a38b344d745475b5f539f8f3f7941aace811','["Plumbing","Electrical","Mechanical"]',1,1,'{"lat":9.012545186760107,"lng":38.88511618036578,"accuracy":13.287420318152812}',1793575785931);

-- engineer_sessions: 1
INSERT OR IGNORE INTO "engineer_sessions" ("token_hash","engineer_id","expires") VALUES ('a3c1849df3d6003df11aa3a6c8b293d4a4b9a4ad2f0367b3f6bb5f2bd09752ad','2276c8cb-2454-4de1-8d63-43f536f9f8b6',1793618833957);

-- engineer_push: 1
INSERT OR IGNORE INTO "engineer_push" ("id","engineer_id","endpoint","session_hash","updated_at") VALUES ('9ec88bc990bed00c9bfa20b359ef0843c7a1ba0da3162749fb0327cf9333886b','2276c8cb-2454-4de1-8d63-43f536f9f8b6','https://web.push.apple.com/QKYHWNrYZh-LdSjA8ImJJl2zZMYVTXXx9KA0l50KAU_D1GeG2bUqUIKKNxvwK6KXZdRzeILmgn8PA2_ADN5en-nG_KUPJYqyFxSWPBSedE40Ymbxed-Rz_veJiH8w6wysmPtx1ZTC5ugz7c_bH8st2ZQFnVHIUyi74IhcWdqIZs','a3c1849df3d6003df11aa3a6c8b293d4a4b9a4ad2f0367b3f6bb5f2bd09752ad',1793575656059);

-- orders: 3
INSERT OR IGNORE INTO "orders" ("id","token_hash","payload","created_at") VALUES ('GUL-1106A9107E898637','a424e17c46eb8d317ecd06bfb01bab400fc12b9b211bde4eb69a988b6af3a9cb','{"name":"Halo","phone":"+251907225566","address":"Semit","city":"Addis Ababa","mapLink":"https://www.google.com/maps/search/?api=1&query=9.012621606655625%2C38.88519710446772","inAddis":true,"items":[{"id":1,"name":"Wireless over-ear headphones","n":1,"price":2800000},{"id":2,"name":"Everyday canvas carry tote","n":1,"price":125000}],"billingVersion":2,"subtotal":2925000,"sellerTotal":2925000,"sellerNet":2543478,"sellerVat":381522,"vat":381522,"service":101739,"serviceVat":15261,"delivery":40000,"deliveryVat":6000,"gulitVat":21261,"gulitTotal":163000,"total":3088000,"status":"Awaiting payment verification","sellerName":"","sellerPayment":{"status":"unpaid","detailsReady":false,"receiptKey":null,"receiptType":null},"gulitPayment":{"status":"review","receiptKey":"receipts/cad7be45-3123-4460-b9ed-a77b4da0242c","receiptType":"image/jpeg"},"distanceKm":null,"receiptKey":null,"receiptType":null}',1793566727749);
INSERT OR IGNORE INTO "orders" ("id","token_hash","payload","created_at") VALUES ('GUL-D4848DC58DF5243E','e5b399b5542312c750e5ebd150583647e9fc3c9059b8a4ee2981499c2fb1d5bb','{"name":"Hamza","phone":"0911225566","address":"Ayat 5","city":"Addis Ababa","inAddis":true,"items":[{"id":6,"name":"Portable Bluetooth speaker","n":1,"price":295000}],"subtotal":295000,"vat":44250,"service":22125,"delivery":40000,"total":401375,"status":"Awaiting payment verification","distanceKm":null,"receiptKey":"receipts/075f7a5e-4076-45ba-a8d2-985be009fea5","receiptType":"image/jpeg"}',1793528034050);
INSERT OR IGNORE INTO "orders" ("id","token_hash","payload","created_at") VALUES ('GUL-F05A4F27E1F5FFC0','a45507cd30117fcc77d8c63c29bb3f505af30a54378032ae684a7e3d539ed36e','{"name":"Hamza","phone":"0911225566","address":"Ayat 5","city":"Addis Ababa","mapLink":"https://www.google.com/maps/search/?api=1&query=9.0123959%2C38.8850582","inAddis":true,"items":[{"id":1,"name":"Wireless over-ear headphones","n":1,"price":2800000},{"id":3,"name":"Ceramic mug · warm ivory","n":1,"price":65000}],"subtotal":2865000,"vat":429750,"service":214875,"delivery":40000,"total":3549625,"status":"Payment verified","distanceKm":null,"receiptKey":"receipts/d96ba66a-c430-476b-9f9b-677a23aab0c0","receiptType":"image/jpeg"}',1793529369275);

-- deliveries: 1
INSERT OR IGNORE INTO "deliveries" ("order_id","driver_id","state","instructions","driver_note","updated_at") VALUES ('GUL-F05A4F27E1F5FFC0','f8868899-c165-47ec-b86b-823cf4ecef93','picked_up','Ayat 5','',1793533633412);

-- order_messages: 9
INSERT OR IGNORE INTO "order_messages" ("id","order_id","sender","body","created_at") VALUES ('2760fab3-d5fb-447f-aa32-93e77cb750fc','HELP-E16A8CA83B9FB7A3','customer','MEP service request — Plumbing
Service: Plumbing
Property: Factory
Customer: Mam
Phone: +251907225566
Site: Addis Ababa Ayat 5
Map: 
Job: Shiny bet alihedim ale
Preferred visit: Tuesday afternoon
Priority: Routine visit
Please confirm provider, inspection fee, labour/materials quote, Gulit service and transport charges before payment or scheduling.',1793575763723);
INSERT OR IGNORE INTO "order_messages" ("id","order_id","sender","body","created_at") VALUES ('378000d1-ef1e-4de8-b27a-112305248d33','HELP-E16A8CA83B9FB7A3','customer','Hello',1793567677708);
INSERT OR IGNORE INTO "order_messages" ("id","order_id","sender","body","created_at") VALUES ('453aa1db-a124-4c3d-b7d2-17ec35188c81','HELP-E16A8CA83B9FB7A3','care','Hello',1793567722906);
INSERT OR IGNORE INTO "order_messages" ("id","order_id","sender","body","created_at") VALUES ('4d39d87b-c2c7-4d43-867e-34a201befa65','HELP-E16A8CA83B9FB7A3','customer','Send me acc for w ceramic',1793567752878);
INSERT OR IGNORE INTO "order_messages" ("id","order_id","sender","body","created_at") VALUES ('6e66c6d3-cc21-4003-a97f-cbffd13571b1','HELP-E16A8CA83B9FB7A3','customer','Hello',1793887889249);
INSERT OR IGNORE INTO "order_messages" ("id","order_id","sender","body","created_at") VALUES ('6f806bcd-6d02-40ae-b107-2afdbe75e88d','HELP-E16A8CA83B9FB7A3','care','100023456778',1793567778141);
INSERT OR IGNORE INTO "order_messages" ("id","order_id","sender","body","created_at") VALUES ('81fac281-eafc-43a9-a359-099d3a670fca','GUL-1106A9107E898637','customer','Account of the seller',1793566810466);
INSERT OR IGNORE INTO "order_messages" ("id","order_id","sender","body","created_at") VALUES ('9f840cc5-4599-4f90-8a53-b18cd1bc4116','HELP-84D8E7ED0521306D','customer','Laundry collection and return request. Name and phone: __. Pickup address / Google Maps link: __. Laundry provider (or help me choose): __. Clothing types and count: __. Wash / iron / dry clean: __. Preferred pickup time: __. Return address and time: __. Please confirm provider price and Gulit service, collection and return charges with VAT before payment.',1793569442124);
INSERT OR IGNORE INTO "order_messages" ("id","order_id","sender","body","created_at") VALUES ('caeb6649-cf38-4454-bce2-a76155bee3ec','HELP-E16A8CA83B9FB7A3','customer','Go',1793575815991);

-- support_threads: 2
INSERT OR IGNORE INTO "support_threads" ("id","token_hash","created_at","updated_at") VALUES ('HELP-84D8E7ED0521306D','a39bfc06c3a967dc9430d574bc8847e58277614065c3707cd9b69d7b58e6ebc3',1793569442124,1793569442124);
INSERT OR IGNORE INTO "support_threads" ("id","token_hash","created_at","updated_at") VALUES ('HELP-E16A8CA83B9FB7A3','04805294f8b2be241e333ecdf8fb0fde6381df86d70320a4534d8ca7590b1288',1793567677708,1793887889249);
