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

export default CategoryCreate;