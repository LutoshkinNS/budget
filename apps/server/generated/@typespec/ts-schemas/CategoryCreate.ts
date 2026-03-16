const CategoryCreate = {
  "type": "object",
  "required": [
    "name"
  ],
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1
    }
  },
  "additionalProperties": false
} as const;

export default CategoryCreate;