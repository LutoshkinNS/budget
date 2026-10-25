import "@typespec/http";
import "./general.tsp";
import "./domains/account.tsp";
import "./domains/transaction.tsp";
import "./domains/category.tsp";
import "./domains/subcategory.tsp";
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

  @route("/{accountId}/members")
  @get listMembers(
    @path accountId: integer
  ): AccountMember[] | AccountForbiddenResponse | AuthUnauthorizedResponse | InternalServerErrorResponse;

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

@route("/accounts/{accountId}/categories")
@tag("Categories")
interface Categories {
  @get list(
    @path accountId: integer,
    @query type?: TransactionType,
    @query sort?: "usage",
  ): Category[] | CategoryErrorResponse | AccountForbiddenResponse | InternalServerErrorResponse;

  @get get(
    @path accountId: integer,
    @path categoryId: integer,
  ): Category | CategoryNotFoundResponse | AccountForbiddenResponse | InternalServerErrorResponse;

  @post create(
    @path accountId: integer,
    @body category: CategoryCreate,
  ): Category | CategoryErrorResponse | CategoryConflictResponse | AccountForbiddenResponse | InternalServerErrorResponse;

  @route("/{categoryId}")
  @patch update(
    @path accountId: integer,
    @path categoryId: integer,
    @body category: CategoryUpdate,
  ): Category | CategoryErrorResponse | CategoryConflictResponse | CategoryNotFoundResponse | AccountForbiddenResponse | InternalServerErrorResponse;

  @delete delete(
    @path accountId: integer,
    @path categoryId: integer,
  ): {
    @statusCode statusCode: 204;
  } | AccountForbiddenResponse | InternalServerErrorResponse;
}

@route("/accounts/{accountId}/categories/{categoryId}/subcategories")
@tag("Subcategories")
interface CategorySubcategories {
  @get list(
    @path accountId: integer,
    @path categoryId: integer,
  ): Subcategory[] | CategoryNotFoundResponse | AccountForbiddenResponse | InternalServerErrorResponse;

  @post create(
    @path accountId: integer,
    @path categoryId: integer,
    @body subcategory: SubcategoryCreate,
  ): Subcategory | CategoryErrorResponse | AccountForbiddenResponse | InternalServerErrorResponse;

  @get get(
    @path accountId: integer,
    @path categoryId: integer,
    @path subcategoryId: integer,
  ): Subcategory | SubcategoryNotFoundResponse | AccountForbiddenResponse | InternalServerErrorResponse;

  @delete delete(
    @path accountId: integer,
    @path categoryId: integer,
    @path subcategoryId: integer,
  ): {
    @statusCode statusCode: 204;
  } | AccountForbiddenResponse | InternalServerErrorResponse;
}

@route("/accounts/{accountId}/transactions")
@tag("Transactions")
interface Transactions {
  @get list(
    @path accountId: integer,
    @query from: utcDateTime,
    @query to: utcDateTime,
    @query type?: TransactionType,
    @minValue(1)
    @query categoryId?: integer,
  ): Transaction[] | TransactionErrorResponse | AccountForbiddenResponse | InternalServerErrorResponse;

  @route("/category-summary")
  @get categorySummary(
    @path accountId: integer,
    @query from: utcDateTime,
    @query to: utcDateTime,
    @query compareFrom: utcDateTime,
    @query compareTo: utcDateTime,
    @query type?: TransactionType,
  ): CategorySummary | TransactionErrorResponse | AccountForbiddenResponse | InternalServerErrorResponse;

  @route("/summary")
  @get summary(
    @path accountId: integer,
    @query from: utcDateTime,
    @query to: utcDateTime,
  ): TransactionSummary | TransactionErrorResponse | AccountForbiddenResponse | InternalServerErrorResponse;

  @route("/{transactionId}")
  @get get(
    @path accountId: integer,
    @path transactionId: integer,
  ): Transaction | TransactionNotFoundResponse | AccountForbiddenResponse | InternalServerErrorResponse;

  @post create(
    @path accountId: integer,
    @body transaction: TransactionCreate,
  ): Transaction | TransactionErrorResponse | TransactionNotFoundResponse | AccountForbiddenResponse | InternalServerErrorResponse;

  @route("/{transactionId}")
  @patch update(
    @path accountId: integer,
    @path transactionId: integer,
    @body transaction: TransactionUpdate,
  ): Transaction | TransactionErrorResponse | TransactionNotFoundResponse | AccountForbiddenResponse | InternalServerErrorResponse;

  @route("/{transactionId}")
  @delete delete(
    @path accountId: integer,
    @path transactionId: integer,
  ): {
    @statusCode statusCode: 204;
  } | AccountForbiddenResponse | InternalServerErrorResponse;
}

@route("/auth")
@tag("Authentication")
interface Auth {
  @route("/client-event")
  @post op clientEvent(
    @body body: AuthClientEvent
  ): SuccessResponse;

  @route("/login")
  @post op login(
    @body loginRequest: LoginRequest
  ): SuccessResponse | AuthUnauthorizedResponse | NotFoundResponse | InternalServerErrorResponse;

  @route("/refresh")
  @post op refresh(): SuccessResponse | AuthUnauthorizedResponse | InternalServerErrorResponse;

  @route("/logout")
  @post op logout(): SuccessResponse | AuthUnauthorizedResponse | InternalServerErrorResponse;

  @route("/me")
  @get op me(): UserInfo | AuthUnauthorizedResponse | InternalServerErrorResponse;
}
