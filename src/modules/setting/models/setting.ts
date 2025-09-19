import { model } from "@medusajs/framework/utils"

export const FedexSetting = model.define(
    "fedex_setting",
    {
        id: model.id().primaryKey(),
        is_enabled: model.boolean(),
        client_id: model.text(),
        client_secret: model.text(),
        account_number: model.text(),
        is_sandbox: model.boolean(),
        enable_logs: model.boolean(),
        weight_unit_of_measure: model.enum(["LB", "KG"])
    }
)
