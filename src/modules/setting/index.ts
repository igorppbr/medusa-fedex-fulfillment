import { Module } from "@medusajs/framework/utils"
import FedexSettingsModuleService from "./service"

export const FEDEX_SETTINGS_MODULE = "fedex_settings"

export default Module(FEDEX_SETTINGS_MODULE, {
  service: FedexSettingsModuleService,
})
