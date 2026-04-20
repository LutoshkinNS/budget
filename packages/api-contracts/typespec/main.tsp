import "@typespec/http";
import "./general.tsp";
import "./domains/account.tsp";
import "./domains/category.tsp";
import "./domains/subcategory.tsp";
import "./domains/expense.tsp";
import "./domains/user.tsp";
import "./domains/auth.tsp";

using Http;
@service(#{title: "Expense service"})
@server("http://localhost:3000", "Single server endpoint")
@route("/api/v1")
namespace ExpenseService;

model idObj{
  id: integer
}

@route("/accounts")
@tag("Accounts")
interface Accounts {
  @get list(): Account[] | AccountNotFoundResponse | InternalServerErrorResponse;

  @route("/{accountId}/invitations")
  @post createInvitation(
    @path accountId: integer
  ): AccountInvitation | AccountForbiddenResponse | AuthUnauthorizedResponse | InternalServerErrorResponse;

  @route("/invitations/redeem")
  @post redeemInvitation(
    @body body: RedeemInvitationRequest
  ): AccountInvitation | InvitationNotFoundResponse | AuthUnauthorizedResponse | InternalServerErrorResponse;

  @route("/{accountId}")
  @patch update(
    @path accountId: AccountId,
    @body body: AccountUpdate,
  ): Account | AccountForbiddenResponse | AuthUnauthorizedResponse | InternalServerErrorResponse;
}

@route("/categories")
@tag("Categories")
interface Categories {
  @get list(): Category[] | CategoryNotFoundResponse | InternalServerErrorResponse;

  @get get(
    @path categoryId: integer,
  ): Category | CategoryNotFoundResponse | InternalServerErrorResponse;

  @post create(
    @body category: CategoryCreate,
  ): Category | CategoryErrorResponse | InternalServerErrorResponse;

  @delete delete(@path categoryId: integer): {
    @statusCode statusCode: 204;
  } | InternalServerErrorResponse;
}

@route("/categories/{categoryId}/subcategories")
@tag("Subcategories")
interface CategorySubcategories {
  @get list(
    @path categoryId: integer,
  ): Subcategory[] | CategoryNotFoundResponse | InternalServerErrorResponse;

  @post create(
    @path categoryId: integer,
    @body subcategory: SubcategoryCreate,
  ): Subcategory | SubcategoryErrorResponse | InternalServerErrorResponse;

  @get get(
    @path categoryId: integer,
    @path subcategoryId: integer,
  ): Subcategory | SubcategoryNotFoundResponse | InternalServerErrorResponse;

  @delete delete(@path categoryId: integer, @path subcategoryId: integer): {
    @statusCode statusCode: 204;
  } | InternalServerErrorResponse;
}

@route("/expenses")
@tag("Expenses")
interface Expenses {
  @get list(@query days?: integer): Expense[] | ExpenseNotFoundResponse;

  @get get(
    @path expenseId: integer,
  ): Expense | ExpenseNotFoundResponse | InternalServerErrorResponse;

  @post create(
    @body expense: ExpenseCreate,
  ): Expense | ExpenseErrorResponse | InternalServerErrorResponse;

  @delete delete(@path expenseId: integer): {
    @statusCode statusCode: 204;
  } | InternalServerErrorResponse;
}

@route("/auth")
@tag("Authentication")
interface Auth {
  @route("/login")
  @post op login(
    @body loginRequest: LoginRequest
  ): SuccessResponse | AuthUnauthorizedResponse | NotFoundResponse | NoAccountResponse | InternalServerErrorResponse;

  @route("/refresh")
  @post op refresh(): SuccessResponse | AuthUnauthorizedResponse | InternalServerErrorResponse;

  @route("/logout")
  @post op logout(): SuccessResponse | AuthUnauthorizedResponse | InternalServerErrorResponse;

  @route("/me")
  @get op me(): UserInfo | AuthUnauthorizedResponse | InternalServerErrorResponse;

  @route("/switch-account")
  @post op switchAccount(
    @body body: SwitchAccountRequest
  ): SuccessResponse | AuthUnauthorizedResponse | AccountForbiddenResponse | InternalServerErrorResponse;
}
