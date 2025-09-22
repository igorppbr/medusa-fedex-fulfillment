import { Migration } from "@mikro-orm/migrations"

export class Migration202509151059 extends Migration {
    async up(): Promise<void> {
        this.addSql(`
            create table if not exists "fedex_setting" (
                "id" text not null primary key,
                "is_enabled" boolean not null,
                "client_id" text not null,
                "client_secret" text not null,
                "account_number" text not null,
                "is_sandbox" boolean not null,
                "enable_logs" boolean not null,
                "weight_unit_of_measure" text check ("weight_unit_of_measure" in ('LB', 'KG')) not null,
                "created_at" timestamptz not null default now(),
                "updated_at" timestamptz not null default now(),
                "deleted_at" timestamptz
            );
        `);
    }

    async down(): Promise<void> {
        this.addSql('drop table if exists "fedex_setting" cascade;');
    }
}
