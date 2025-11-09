import "./../general.tsp";

using Http;

model User {
  @minValue(1)
  id: integer;
}