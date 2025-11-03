const Category = {
  "type": "object",
  "required": [
    "id",
    "url",
    "title"
  ],
  "properties": {
    "id": {
      "type": "integer"
    },
    "url": {
      "type": "string"
    },
    "title": {
      "type": "string"
    }
  },
  "additionalProperties": false
} as const;

export default Category;