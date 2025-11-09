import "@typespec/http";
import "./general.tsp"
import "./domains/category.tsp"
import "./domains/subcategory.tsp"
import "./domains/expense.tsp"
import "./domains/user.tsp"

using Http;
@service(#{ title: "Expense service" })
@server("https://example.com", "Single server endpoint")
namespace ExpenseService;

@route("/categories")
@tag("Categories")
interface Categories {
  @get list(): CategoryListResponse | CategoryNotFoundResponse;

  @get get(
    @path categoryId: integer,
  ): CategoryResponse | CategoryNotFoundResponse | InternalServerErrorResponse;

  @post create(
    @body category: CategoryCreate,
  ): CategoryCreatedResponse | CategoryErrorResponse | InternalServerErrorResponse;

  @delete delete(@path categoryId: integer): {
    @statusCode statusCode: 204;
  } | InternalServerErrorResponse;
}

@route("/categories/{categoryId}/subcategories")
@tag("Subcategories")
interface CategorySubcategories {
  @get list(
    @path categoryId: integer,
  ): SubcategoryListResponse | CategoryNotFoundResponse | InternalServerErrorResponse;

  @post create(
    @path categoryId: integer,
    @body subcategory: SubcategoryCreate,
  ): SubcategoryCreatedResponse | SubcategoryErrorResponse | InternalServerErrorResponse;

  @get get(
    @path categoryId: integer,
    @path subcategoryId: integer,
  ): SubcategoryResponse | SubcategoryNotFoundResponse | InternalServerErrorResponse;

  @delete delete(@path categoryId: integer, @path subcategoryId: integer): {
    @statusCode statusCode: 204;
  } | InternalServerErrorResponse;
}

@route("/expenses")
@tag("Expenses")
interface Expenses {
  @get list(): ExpenseListResponse | ExpenseNotFoundResponse;

  @get get(
    @path expenseId: integer,
  ): ExpenseResponse | ExpenseNotFoundResponse | InternalServerErrorResponse;

  @post create(
    @body expense: ExpenseCreate,
  ): ExpenseCreatedResponse | ExpenseErrorResponse | InternalServerErrorResponse;

  @delete delete(@path expenseId: integer): {
    @statusCode statusCode: 204;
  } | InternalServerErrorResponse;
}
