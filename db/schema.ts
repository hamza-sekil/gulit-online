import { sqliteTable, integer, text, primaryKey, index, real } from "drizzle-orm/sqlite-core";
export const products = sqliteTable("products", {
 id: integer("id").primaryKey(), name: text("name").notNull(), category: text("category").notNull(),
 priceCents: integer("price_cents").notNull(), stock: integer("stock").notNull(), image: text("image").notNull(),
 archived: integer("archived").notNull().default(0), revision: integer("revision").notNull().default(1),
 manufacturingDate: text("manufacturing_date"), expiryDate: text("expiry_date"),
 updatedBy: text("updated_by").notNull(), updatedAt: text("updated_at").notNull()
});

export const adminCredentials = sqliteTable("admin_credentials", {
 id: integer("id").primaryKey(), username: text("username").notNull(), salt: text("salt").notNull(), passwordHash: text("password_hash").notNull()
});
export const adminSessions = sqliteTable("admin_sessions", {
 tokenHash: text("token_hash").primaryKey(), expires: integer("expires").notNull()
});
export const adminAttempts = sqliteTable("admin_attempts", {
 key: text("key").primaryKey(), count: integer("count").notNull(), until: integer("until").notNull()
});

export const orders = sqliteTable("orders", {
 id: text("id").primaryKey(), tokenHash: text("token_hash").notNull(), payload: text("payload").notNull(), createdAt: integer("created_at").notNull()
});

export const drivers = sqliteTable("drivers", { id:text("id").primaryKey(), name:text("name").notNull(), username:text("username").notNull().unique(), codeHash:text("code_hash").notNull(), active:integer("active").notNull().default(1), grp:text("grp").notNull().default('own'), tripFee:integer("trip_fee").notNull().default(0), phone:text("phone"), available:integer("available").notNull().default(0), lat:real("lat"), lng:real("lng"), locationAt:integer("location_at") });
export const driverSessions = sqliteTable("driver_sessions", { tokenHash:text("token_hash").primaryKey(), driverId:text("driver_id").notNull(), expires:integer("expires").notNull() });
export const deliveries = sqliteTable("deliveries", { orderId:text("order_id").primaryKey(), driverId:text("driver_id").notNull(), state:text("state").notNull(), instructions:text("instructions").notNull(), driverNote:text("driver_note").notNull(), updatedAt:integer("updated_at").notNull(), provider:text("provider").notNull().default('own'), costCents:integer("cost_cents").notNull().default(0), assignedBy:text("assigned_by").notNull().default('owner') });

export const orderMessages=sqliteTable("order_messages",{id:text("id").primaryKey(),orderId:text("order_id").notNull(),sender:text("sender").notNull(),body:text("body").notNull(),createdAt:integer("created_at").notNull()});

export const supportThreads=sqliteTable("support_threads",{id:text("id").primaryKey(),tokenHash:text("token_hash").notNull(),createdAt:integer("created_at").notNull(),updatedAt:integer("updated_at").notNull()});

export const engineers=sqliteTable('engineers',{id:text('id').primaryKey(),name:text('name').notNull(),username:text('username').notNull().unique(),codeHash:text('code_hash').notNull(),skills:text('skills').notNull(),active:integer('active').notNull().default(1),available:integer('available').notNull().default(0),location:text('location'),locationAt:integer('location_at')});
export const engineerSessions=sqliteTable('engineer_sessions',{tokenHash:text('token_hash').primaryKey(),engineerId:text('engineer_id').notNull(),expires:integer('expires').notNull()});
export const serviceJobs=sqliteTable('service_jobs',{id:text('id').primaryKey(),trade:text('trade').notNull(),engineerId:text('engineer_id'),state:text('state').notNull(),payload:text('payload').notNull(),note:text('note').notNull(),revision:integer('revision').notNull().default(1),createdAt:integer('created_at').notNull(),updatedAt:integer('updated_at').notNull()});

export const engineerPush=sqliteTable('engineer_push',{id:text('id').primaryKey(),engineerId:text('engineer_id').notNull(),endpoint:text('endpoint').notNull(),sessionHash:text('session_hash').notNull(),updatedAt:integer('updated_at').notNull()});

export const stores=sqliteTable('stores',{id:text('id').primaryKey(),name:text('name').notNull(),username:text('username').notNull().unique(),codeHash:text('code_hash').notNull(),active:integer('active').notNull().default(1),chapaSubaccount:text('chapa_subaccount'),commissionBps:integer('commission_bps').notNull().default(100),lat:real('lat'),lng:real('lng'),openTime:text('open_time'),closeTime:text('close_time'),radiusKm:real('radius_km'),contactPhone:text('contact_phone')});
export const storeSessions=sqliteTable('store_sessions',{tokenHash:text('token_hash').primaryKey(),storeId:text('store_id').notNull(),expires:integer('expires').notNull()});
export const storeStock=sqliteTable('store_stock',{storeId:text('store_id').notNull(),productId:integer('product_id').notNull(),quantity:integer('quantity').notNull().default(0),manufacturingDate:text('manufacturing_date'),expiryDate:text('expiry_date'),priceCents:integer('price_cents'),revision:integer('revision').notNull().default(1),updatedAt:integer('updated_at').notNull(),updatedBy:text('updated_by').notNull()},(t)=>[primaryKey({columns:[t.storeId,t.productId]})]);

export const paymentAttempts=sqliteTable('payment_attempts',{txRef:text('tx_ref').primaryKey(),orderId:text('order_id').notNull(),party:text('party').notNull(),amountCents:integer('amount_cents').notNull(),status:text('status').notNull(),providerRef:text('provider_ref'),createdAt:integer('created_at').notNull(),updatedAt:integer('updated_at').notNull()},(t)=>[index('payment_attempts_order_idx').on(t.orderId)]);
export const settings=sqliteTable('settings',{key:text('key').primaryKey(),value:text('value').notNull(),updatedAt:integer('updated_at').notNull()});
export const orderPush=sqliteTable('order_push',{id:text('id').primaryKey(),orderId:text('order_id').notNull(),endpoint:text('endpoint').notNull(),createdAt:integer('created_at').notNull()},(t)=>[index('order_push_order_idx').on(t.orderId)]);
export const partnerApplications=sqliteTable('partner_applications',{id:text('id').primaryKey(),createdAt:integer('created_at').notNull(),status:text('status').notNull().default('new'),payload:text('payload').notNull(),note:text('note').notNull().default(''),storeId:text('store_id')});
