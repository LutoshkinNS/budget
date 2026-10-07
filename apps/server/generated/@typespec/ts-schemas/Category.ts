const Category = {
  "type": "object",
  "required": [
    "id",
    "accountId",
    "type",
    "name",
    "iconKey"
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
    },
    "iconKey": {
      "anyOf": [
        {
          "type": "string",
          "enum": [
            "groceries",
            "meals",
            "clothes",
            "sport",
            "car",
            "home",
            "leisure",
            "mobile",
            "internet",
            "gifts",
            "public-transport",
            "pets",
            "subscriptions",
            "games",
            "education",
            "travel",
            "taxi",
            "apartment",
            "health",
            "beauty"
          ]
        },
        {
          "type": "null"
        }
      ]
    }
  },
  "additionalProperties": false
} as const;

export default Category;