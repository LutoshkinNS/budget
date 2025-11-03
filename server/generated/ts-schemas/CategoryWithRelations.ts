const CategoryWithRelations = {
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
    },
    "posts": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "id",
          "url",
          "title",
          "content",
          "categoryId",
          "variant",
          "replyId",
          "lat",
          "lng"
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
          },
          "content": {
            "type": "string"
          },
          "categoryId": {
            "type": "integer"
          },
          "variant": {
            "type": "string",
            "enum": [
              "SIMPLE",
              "REPLY",
              "TRAVEL"
            ]
          },
          "replyId": {
            "anyOf": [
              {
                "type": "integer"
              },
              {
                "type": "null"
              }
            ]
          },
          "lat": {
            "anyOf": [
              {
                "type": "number"
              },
              {
                "type": "null"
              }
            ]
          },
          "lng": {
            "anyOf": [
              {
                "type": "number"
              },
              {
                "type": "null"
              }
            ]
          }
        },
        "additionalProperties": false
      }
    }
  },
  "additionalProperties": false
} as const;

export default CategoryWithRelations;