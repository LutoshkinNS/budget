const ExpenseCreate = {
  "type": "object",
  "required": [
    "amount",
    "categoryId"
  ],
  "properties": {
    "amount": {
      "type": "number",
      "format": "double",
      "minimum": 0.01
    },
    "categoryId": {
      "type": "integer",
      "minimum": 1
    },
    "description": {
      "type": "string"
    },
    "date": {
      "type": "string",
      "format": "date-time"
    }
  },
  "additionalProperties": false
} as const;

export default ExpenseCreate;