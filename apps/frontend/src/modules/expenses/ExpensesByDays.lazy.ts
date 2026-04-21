// Тонкий публичный entry-point для ленивой загрузки: импорт из index.ts втянул бы
// в чанк весь модуль (CreateExpense, useCreateExpense и т.д.), а импорт из ui/
// нарушил бы фрактальную границу. Этот файл — граница для makeLazy.
export { ExpensesByDays } from "./ui/ExpensesByDays/ExpensesByDays";
