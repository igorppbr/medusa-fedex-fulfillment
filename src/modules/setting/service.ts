import { FedexSetting } from "./models/setting"
import { MedusaService } from "@medusajs/framework/utils"
import { SetupCredentialsInput } from "../../api/admin/fedex/route";

class FedexSettingsModuleService extends MedusaService({
  FedexSetting,
}) {
  /**
   * Updates the FedEx API credentials.
   * @param input The new credentials to set.
   * @returns True if the update was successful, false otherwise.
   */
  async updateCredentials(input: SetupCredentialsInput): Promise<boolean> {
    const fedexSettings = await this.listFedexSettings();
    if (fedexSettings.length) {
      // Update the existing FedEx settings
      const result = await this.updateFedexSettings({
        ...input,
        id: fedexSettings[0].id
      });
      return !!result;
    } else {
      // Create new FedEx settings
      const result = await this.createFedexSettings(input);
      return !!result;
    }
  }

  /**
   * Retrieves the FedEx API credentials.
   * @returns The FedEx API credentials or null if not found.
   */
  async getCredentials(): Promise<SetupCredentialsInput | null> {
    const fedexSettings = await this.listFedexSettings();
    if (fedexSettings.length) {
      return fedexSettings[0];
    }
    return null;
  }
}

export default FedexSettingsModuleService
