import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading } from "@medusajs/ui"
import { 
  DetailWidgetProps, 
  AdminOrder,
} from "@medusajs/framework/types"

type FulfillmentLabelType = {
  label_url?: string
  tracking_number?: string
  tracking_url?: string
}

type FulfillmentType = {
    labels?: FulfillmentLabelType[]
    tracking_url?: string
}[];

// The widget
const FedexWidget = ({ 
  data,
}: DetailWidgetProps<AdminOrder>) => {
  // If no fulfillments, return an empty component
  if (!data.fulfillments || data.fulfillments.length === 0) {
    return <></>
  }

  // Gather all tracking info with a label_url
  const trackingInfo = data.fulfillments.flatMap((fulfillment: FulfillmentType) =>
    (fulfillment.labels || [])
      .filter((label: FulfillmentLabelType) => label.label_url)
      .map((label: FulfillmentLabelType) => ({
        trackingNumber: label.tracking_number,
        trackingUrl: label.tracking_url,
        labelUrl: label.label_url,
      }))
  )

  // If no valid labels, return an empty component
  if (trackingInfo.length === 0) {
    return <></>
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">
            FedEx Shipping Labels
        </Heading>
      </div>
      {trackingInfo.map((info, idx) => (
        <div
          key={idx}
          className="text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4"
        >
          <p className="font-medium font-sans txt-compact-small">
            Tracking
          </p>
          <ul>
            <li>
              <p className="font-normal font-sans txt-compact-small">
                {info.trackingNumber ? (
                  info.trackingUrl ? (
                    <a
                      href={info.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {info.trackingNumber}
                    </a>
                  ) : (
                    info.trackingNumber
                  )
                ) : (
                  "N/A"
                )}
                {" "}
                <a
                  href={info.labelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                  download
                >
                  Download Label
                </a>
              </p>
            </li>
          </ul>
        </div>
      ))}
    </Container>
  )
}

// The widget's configurations
export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default FedexWidget
