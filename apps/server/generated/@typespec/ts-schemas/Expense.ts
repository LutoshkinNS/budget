const Expense = {
  "type": "object",
  "required": [
    "id",
    "accountId",
    "amount",
    "categoryId",
    "date"
  ],
  "properties": {
    "id": {
      "type": "integer",
      "minimum": 1
    },
    "accountId": {
      "type": "integer",
      "minimum": 1
    },
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
      "anyOf": [
        {
          "type": "string"
        },
        {
          "type": "null"
        }
      ]
    },
    "date": {
      "type": "string",
      "format": "date-time"
    }
  },
  "additionalProperties": false
} as const;

export default Expense;