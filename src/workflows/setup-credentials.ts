import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";

import { FEDEX_SETTINGS_MODULE } from "../modules/setting";
import { SetupCredentialsInput, SetupCredentialsResponse } from "../api/admin/fedex/route";
import FedexSettingsModuleService from "../modules/setting/service";

/**
 * Save credentials in the database
 * @param input The credentials to save.
 * @returns True if the credentials were saved successfully, false otherwise.
 */
const saveCredentials = createStep(
  "save-fedex-credentials",
  async (
    input: SetupCredentialsInput,
    { container }
  ): Promise<StepResponse<boolean>> => {
    const fedexSettingService: FedexSettingsModuleService = container.resolve(FEDEX_SETTINGS_MODULE)
    const result = await fedexSettingService.updateCredentials(input);
    return new StepResponse(result);
  }
);

/**
 * Sets up the FedEx API credentials.
 * @param input The credentials to set up.
 * @returns The result of the setup process.
 */
const setupCredentialsWorkflow = createWorkflow(
  "setup-fedex-credentials",
  (input: SetupCredentialsInput): WorkflowResponse<SetupCredentialsResponse> => {
    const success = saveCredentials(input);
    return new WorkflowResponse({
      success,
      input
    });
  }
)

export default setupCredentialsWorkflow;
