import { Container, Hint, Select, Input, Label, Switch, Button, Alert } from "@medusajs/ui"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { sdk } from "../../../lib/sdk"
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useEffect } from "react"

const initialState = {
  is_enabled: true,
  client_id: "",
  client_secret: "",
  account_number: "",
  is_sandbox: false,
  enable_logs: false,
  weight_unit_of_measure: "",
}

const queryClient = new QueryClient();

const FedexSettingsPageInner = () => {
  // Fetch config from the backend
  const { data, isLoading } = useQuery({
    queryFn: () => sdk.client.fetch("/admin/fedex"),
    queryKey: ["fedex-config"],
  })

  // Merge fetched data with initial state
  const [form, setForm] = useState(initialState)
  const [setTouched] = useState<Record<string, boolean>>({})
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)

  useEffect(() => {
    if (data) {
      setForm(prev => ({
        ...prev,
        ...data,
      }))
    }
  }, [data])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  const handleSelect = (value: string) => {
    setForm((prev) => ({
      ...prev,
      weight_unit_of_measure: value,
    }))
    setTouched((prev) => ({ ...prev, weight_unit_of_measure: true }))
  }

  const isValid =
    form.client_id.trim() &&
    form.client_secret.trim() &&
    form.account_number.trim() &&
    form.weight_unit_of_measure

  if (isLoading) {
    return <Container className="divide-y p-0"><div className="px-6 py-4">Loading...</div></Container>
  }

  async function handleSave(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> {
    event.preventDefault()
    try {
      await sdk.client.fetch("/admin/fedex", {
        method: "POST",
        body: form,
        headers: {
          "Content-Type": "application/json"
        }
      })
      // Optionally, show a success message or refetch config
      setAlert({ type: "success", message: "FedEx settings saved successfully." })

      // Focus on the alert component
      document.querySelector(".alert")?.scrollIntoView({ behavior: "smooth" })
    } catch (error) {
      // Optionally, show an error message
      setAlert({ type: "error", message: "Failed to save FedEx settings." })
      // Focus on the alert component
      document.querySelector(".alert")?.scrollIntoView({ behavior: "smooth" })
      console.error(error)
    }
  }

  return (
    <Container className="divide-y p-0">
      {alert && (
        <div className="px-6 py-2">
          <Alert variant={alert.type === "success" ? "success" : "error"} dismissible={true}>
            {alert.message}
          </Alert>
        </div>
      )}
      <div className="flex items-center justify-between px-6 py-4">
        <svg
            height="120"
            width="120"
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="_x31_25-fedex">
              <g>
                <path
                  d="M251.777,183.644v61.553h-0.36c-6.899-7.906-15.452-10.637-25.443-10.637
                  c-20.412,0-35.793,13.943-41.184,32.271c-12.937-42.694-70.006-41.4-87.615-10.063v-17.393H57.787v-18.831h43.125v-29.541H22.568
                  V323.54h35.219v-55.703h35.147c-1.079,4.097-1.653,8.483-1.653,13.081c0,52.542,73.744,65.692,93.58,17.034h-30.187
                  c-10.566,15.022-32.919,6.396-32.919-10.493h61.453c2.659,21.921,19.694,40.897,43.197,40.897
                  c10.134,0,19.407-4.959,25.084-13.371h0.359v8.555h44.717v-19.896v-30v-30v-40l0.002-20H251.777z M122.688,268.123
                  c4.386-18.902,29.973-18.398,33.423,0H122.688z M232.946,303.272c-24.869,0-24.438-45.139,0-45.139
                  C256.377,258.134,257.742,303.272,232.946,303.272z"
                  fill="#442E8C"
                />
                <polygon
                  points="375.345,323.332 296.156,323.332 296.156,183.661 375.848,183.661 375.848,208.995
                  328.787,208.995 328.787,237.432 375.345,237.432 375.345,261.004 328.283,261.004 328.283,298.503 375.345,298.503
                  375.345,323.332"
                  fill="#F47624"
                />
                <polygon
                  points="433.393,298.585 411.496,323.333 379.537,323.333 417.789,280.382 379.537,237.429
                  412.84,237.429 435.154,262.01 456.631,237.429 488.928,237.429 450.844,280.215 489.432,323.333 455.456,323.333
                  433.393,298.585"
                  fill="#F47624"
                />
              </g>
            </g>
          </svg>
      </div>
      <div className="flex items-center justify-between px-6 py-4">
        <p className="block">You can also configure the FedEx credentials on the medusa-config.ts file as described on <a href="https://github.com/Imagination-Media/medusa-fedex-fulfillment?tab=readme-ov-file#installation" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold">the documentation.</a> If the credentials are set up here they will be used over the medusa-config.ts file.</p>
      </div>
      <form className="flex flex-col gap-y-6 px-6 py-4">
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="is_enabled">Enabled</Label>
            <Switch
              id="is_enabled"
              name="is_enabled"
              checked={form.is_enabled}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, is_enabled: checked }))
              }
            />
          </div>
          <Hint className="mb-2 mt-1">Enable or disable the FedEx integration.</Hint>
        </div>

        <div>
          <Label htmlFor="client_id">Client ID</Label>
            <Hint className="mt-1 block pb-1">Your FedEx API Client ID for authentication.</Hint>
          <Input
            id="client_id"
            name="client_id"
            className="mt-1"
            autoComplete="off"
            value={form.client_id}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="client_secret">Client Secret</Label>
          <Hint className="mt-1 block pb-1">Your FedEx API Client Secret for authentication.</Hint>
          <Input
            id="client_secret"
            name="client_secret"
            type="password"
            className="mt-1"
            autoComplete="off"
            value={form.client_secret}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="account_number">Account Number</Label>
          <Hint className="mt-1 block pb-1">Your FedEx account number used for shipments.</Hint>
          <Input
            id="account_number"
            name="account_number"
            className="mt-1"
            autoComplete="off"
            value={form.account_number}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="is_sandbox">Sandbox Mode</Label>
            <Switch
              id="is_sandbox"
              name="is_sandbox"
              checked={form.is_sandbox}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, is_sandbox: checked }))
              }
            />
          </div>
          <Hint className="mb-2 mt-1">Enable to use FedEx sandbox environment for testing.</Hint>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="enable_logs">Enable Logs</Label>
            <Switch
              id="enable_logs"
              name="enable_logs"
              checked={form.enable_logs}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, enable_logs: checked }))
              }
            />
          </div>
          <Hint className="mb-2 mt-1">Enable logging for debugging FedEx requests and responses.</Hint>
        </div>

        <div>
          <Label htmlFor="weight_unit_of_measure">Weight Unit of Measure</Label>
          <Hint className="mt-1 block pb-1">Select the unit of measure for package weights (LB or KG).</Hint>
          <Select
            value={form.weight_unit_of_measure}
            onValueChange={handleSelect}
            required
          >
            <Select.Trigger>
              <Select.Value placeholder="Select a weight unit" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item key="LB" value="LB">
                LB
              </Select.Item>
              <Select.Item key="KG" value="KG">
                KG
              </Select.Item>
            </Select.Content>
          </Select>
        </div>

        <Button type="button" onClick={handleSave} disabled={!isValid} className="mt-4 w-fit">
          Save
        </Button>
      </form>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "FedEx"
})

const FedexSettingsPage = () => (
  <QueryClientProvider client={queryClient}>
    <FedexSettingsPageInner />
  </QueryClientProvider>
)

export default FedexSettingsPage
