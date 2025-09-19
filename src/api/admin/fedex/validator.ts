import { z } from "zod"

export const PostFedexSettings = z.object({
  is_enabled: z.boolean(),
  client_id: z.string().min(2).max(100),
  client_secret: z.string().min(2).max(100),
  account_number: z.string().min(2).max(100),
  is_sandbox: z.boolean(),
  enable_logs: z.boolean(),
  weight_unit_of_measure: z.enum(["LB", "KG"]),
})
