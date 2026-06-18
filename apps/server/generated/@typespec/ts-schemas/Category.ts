const Category = {
  "type": "object",
  "required": [
    "id",
    "accountId",
    "type",
    "name"
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
    "type": {
      "type": "string",
      "enum": [
        "income",
        "expense"
      ]
    },
    "name": {
      "type": "string",
      "minLength": 1
    }
  },
  "additionalProperties": false
} as const;

export default Category;