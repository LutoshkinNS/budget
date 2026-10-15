const CategoryUpdate = {
  "type": "object",
  "properties": {
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

export default CategoryUpdate;