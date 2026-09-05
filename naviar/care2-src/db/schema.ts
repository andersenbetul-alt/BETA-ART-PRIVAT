import {sqliteTable,text,integer,uniqueIndex,index,primaryKey} from 'drizzle-orm/sqlite-core';
import {sql} from 'drizzle-orm';
export const slots=sqliteTable('slots',{id:text().primaryKey(),starts:integer().notNull(),ends:integer().notNull()});
export const bookings=sqliteTable('bookings',{
 id:text().primaryKey(),owner:text().notNull(),slot:text().notNull().references(()=>slots.id),locale:text().notNull(),status:text().notNull().default('active'),key:text().notNull(),created:integer().notNull(),updated:integer().notNull(),payment:text().notNull().default('none'),session:text(),amount:integer().notNull().default(10000),currency:text().notNull().default('nok')
},t=>[uniqueIndex('bookings_active_slot').on(t.slot).where(sql`${t.status} = 'active'`),uniqueIndex('bookings_owner_key').on(t.owner,t.key),index('bookings_owner').on(t.owner)]);
export const outbox=sqliteTable('outbox',{id:text().primaryKey(),booking:text().notNull().references(()=>bookings.id,{onDelete:'cascade'}),kind:text().notNull(),locale:text().notNull(),starts:integer().notNull(),created:integer().notNull(),state:text().notNull().default('preview'),providerId:text(),attempts:integer().notNull().default(0)});
export const webhookEvents=sqliteTable('webhook_events',{id:text().primaryKey(),created:integer().notNull(),kind:text().notNull()});
export const consent=sqliteTable('consent_receipts',{id:text().primaryKey(),choice:text().notNull(),version:text().notNull(),created:integer().notNull()});
export const metrics=sqliteTable('metrics',{day:text().notNull(),page:text().notNull(),locale:text().notNull(),kind:text().notNull(),count:integer().notNull().default(0)},t=>[primaryKey({columns:[t.day,t.page,t.locale,t.kind]})]);
export const eventKeys=sqliteTable('event_keys',{id:text().primaryKey(),created:integer().notNull()});
