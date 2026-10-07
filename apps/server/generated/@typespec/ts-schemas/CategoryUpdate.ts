const CategoryUpdate = {
  "type": "object",
  "required": [
    "iconKey"
  ],
  "properties": {
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