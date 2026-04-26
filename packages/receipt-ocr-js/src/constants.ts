export const DEFAULT_MODEL = "gpt-4.1";

export const DEFAULT_SCHEMA = {
  merchant_name: "string",
  merchant_address: "string",
  transaction_date: "string",
  transaction_time: "string",
  total_amount: "number",
  line_items: [
    {
      item_name: "string",
      item_quantity: "number",
      item_price: "number",
    },
  ],
} as const;
