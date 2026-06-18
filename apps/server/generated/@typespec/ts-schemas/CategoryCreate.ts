const CategoryCreate = {
  "type": "object",
  "required": [
    "type",
    "name"
  ],
  "properties": {
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

export default CategoryCreate;