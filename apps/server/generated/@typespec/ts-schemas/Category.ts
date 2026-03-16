const Category = {
  "type": "object",
  "required": [
    "id",
    "accountId",
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
    "name": {
      "type": "string",
      "minLength": 1
    }
  },
  "additionalProperties": false
} as const;

export default Category;