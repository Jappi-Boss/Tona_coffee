export const enquiryCoffeeInterests = {
  "Retail order": "House Blend",
  "Export enquiry": "Export",
  "Wholesale / business supply": "House Blend",
  "Local Distribution": "House Blend",
  Feedback: null,
  "Something else": null,
} as const;

export type EnquiryRequestType = keyof typeof enquiryCoffeeInterests;

export function enquiryCoffeeInterest(requestType: string) {
  return Object.hasOwn(enquiryCoffeeInterests, requestType)
    ? enquiryCoffeeInterests[requestType as EnquiryRequestType]
    : null;
}
