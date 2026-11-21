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
  @get list(): Account[] | ValidationErrorResponse | AuthUnauthorizedResponse | HttpNotFoundResponse | InternalServerErrorResponse | TooManyRequestsResponse;

  @route("/{accountId}/members")
  @get listMembers(
    @path accountId: integer
  ): AccountMember[] | ValidationErrorResponse | HttpForbiddenResponse | AuthUnauthorizedResponse | InternalServerErrorResponse | TooManyRequestsResponse;

  @route("/{accountId}/invitations")
  @post createInvitation(
    @path accountId: integer
  ): AccountInvitation | ValidationErrorResponse | HttpForbiddenResponse | AuthUnauthorizedResponse | PayloadTooLargeErrorResponse | UnsupportedMediaTypeErrorResponse | InternalServerErrorResponse | TooManyRequestsResponse;

  @route("/invitations/redeem")
  @post redeemInvitation(
    @body body: RedeemInvitationRequest
  ): AccountInvitation | ValidationErrorResponse | HttpNotFoundResponse | InvitationNotFoundResponse | AuthUnauthorizedResponse | PayloadTooLargeErrorResponse | UnsupportedMediaTypeErrorResponse | InternalServerErrorResponse | TooManyRequestsResponse;

  @route("/{accountId}")
  @patch update(
    @path accountId: AccountId,
    @body body: AccountUpdate,
  ): Account | ValidationErrorResponse | HttpForbiddenResponse | AuthUnauthorizedResponse | PayloadTooLargeErrorResponse | UnsupportedMediaTypeErrorResponse | InternalServerErrorResponse | TooManyRequestsResponse;
}

@route("/accounts/{accountId}/categories")
@tag("Categories")
interface Categories {
  @get list(
    @path accountId: integer,
    @query type?: TransactionType,
    @query sort?: "usage",
  ): Category[] | CategoryErrorResponse | HttpForbiddenResponse | AuthUnauthorizedResponse | InternalServerErrorResponse | TooManyRequestsResponse;

  @get get(
    @path accountId: integer,
    @path categoryId: integer,
  ): Category | ValidationErrorResponse | HttpNotFoundResponse | HttpForbiddenResponse | AuthUnauthorizedResponse | InternalServerErrorResponse | TooManyRequestsResponse;

  @post create(
    @path accountId: integer,
    @body category: CategoryCreate,
  ): Category | CategoryErrorResponse | HttpConflictResponse | CategoryConflictResponse | HttpForbiddenResponse | AuthUnauthorizedResponse | PayloadTooLargeErrorResponse | UnsupportedMediaTypeErrorResponse | InternalServerErrorResponse | TooManyRequestsResponse;

  @route("/{categoryId}")
  @patch update(
    @path accountId: integer,
    @path categoryId: integer,
    @body category: CategoryUpdate,
  ): Category | CategoryErrorResponse | HttpConflictResponse | CategoryConflictResponse | HttpNotFoundResponse | HttpForbiddenResponse | AuthUnauthorizedResponse | PayloadTooLargeErrorResponse | UnsupportedMediaTypeErrorResponse | InternalServerErrorResponse | TooManyRequestsResponse;

  @delete delete(
    @path accountId: integer,
    @path categoryId: integer,
  ): {
    @statusCode statusCode: 204;
  } | ValidationErrorResponse | HttpForbiddenResponse | AuthUnauthorizedResponse | PayloadTooLargeErrorResponse | UnsupportedMediaTypeErrorResponse | InternalServerErrorResponse | TooManyRequestsResponse;
}

@route("/accounts/{accountId}/categories/{categoryId}/subcategories")
@tag("Subcategories")
interface CategorySubcategories {
  @get list(
    @path accountId: integer,
    @path categoryId: integer,
  ): Subcategory[] | ValidationErrorResponse | HttpNotFoundResponse | HttpForbiddenResponse | AuthUnauthorizedResponse | InternalServerErrorResponse | TooManyRequestsResponse;

  @post create(
    @path accountId: integer,
    @path categoryId: integer,
    @body subcategory: SubcategoryCreate,
  ): Subcategory | CategoryErrorResponse | HttpNotFoundResponse | HttpForbiddenResponse | AuthUnauthorizedResponse | PayloadTooLargeErrorResponse | UnsupportedMediaTypeErrorResponse | InternalServerErrorResponse | TooManyRequestsResponse;

  @get get(
    @path accountId: integer,
    @path categoryId: integer,
    @path subcategoryId: integer,
  ): Subcategory | ValidationErrorResponse | HttpNotFoundResponse | HttpForbiddenResponse | AuthUnauthorizedResponse | InternalServerErrorResponse | TooManyRequestsResponse;

  @delete delete(
    @path accountId: integer,
    @path categoryId: integer,
    @path subcategoryId: integer,
  ): {
    @statusCode statusCode: 204;
  } | ValidationErrorResponse | HttpForbiddenResponse | AuthUnauthorizedResponse | PayloadTooLargeErrorResponse | UnsupportedMediaTypeErrorResponse | InternalServerErrorResponse | TooManyRequestsResponse;
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
  ): Transaction[] | TransactionErrorResponse | HttpForbiddenResponse | AuthUnauthorizedResponse | InternalServerErrorResponse | TooManyRequestsResponse;

  @route("/category-summary")
  @get categorySummary(
    @path accountId: integer,
    @query from: utcDateTime,
    @query to: utcDateTime,
    @query compareFrom: utcDateTime,
    @query compareTo: utcDateTime,
    @query type?: TransactionType,
  ): CategorySummary | TransactionErrorResponse | HttpForbiddenResponse | AuthUnauthorizedResponse | InternalServerErrorResponse | TooManyRequestsResponse;

  @route("/summary")
  @get summary(
    @path accountId: integer,
    @query from: utcDateTime,
    @query to: utcDateTime,
  ): TransactionSummary | TransactionErrorResponse | HttpForbiddenResponse | AuthUnauthorizedResponse | InternalServerErrorResponse | TooManyRequestsResponse;

  @route("/{transactionId}")
  @get get(
    @path accountId: integer,
    @path transactionId: integer,
  ): Transaction | ValidationErrorResponse | HttpNotFoundResponse | HttpForbiddenResponse | AuthUnauthorizedResponse | InternalServerErrorResponse | TooManyRequestsResponse;

  @post create(
    @path accountId: integer,
    @body transaction: TransactionCreate,
  ): Transaction | TransactionErrorResponse | HttpNotFoundResponse | HttpForbiddenResponse | AuthUnauthorizedResponse | PayloadTooLargeErrorResponse | UnsupportedMediaTypeErrorResponse | InternalServerErrorResponse | TooManyRequestsResponse;

  @route("/{transactionId}")
  @patch update(
    @path accountId: integer,
    @path transactionId: integer,
    @body transaction: TransactionUpdate,
  ): Transaction | TransactionErrorResponse | HttpNotFoundResponse | HttpForbiddenResponse | AuthUnauthorizedResponse | PayloadTooLargeErrorResponse | UnsupportedMediaTypeErrorResponse | InternalServerErrorResponse | TooManyRequestsResponse;

  @route("/{transactionId}")
  @delete delete(
    @path accountId: integer,
    @path transactionId: integer,
  ): {
    @statusCode statusCode: 204;
  } | ValidationErrorResponse | HttpForbiddenResponse | AuthUnauthorizedResponse | PayloadTooLargeErrorResponse | UnsupportedMediaTypeErrorResponse | InternalServerErrorResponse | TooManyRequestsResponse;
}

@route("/auth")
@tag("Authentication")
interface Auth {
  @route("/client-event")
  @post op clientEvent(
    @body body: AuthClientEvent
  ): SuccessResponse | ValidationErrorResponse | PayloadTooLargeErrorResponse | UnsupportedMediaTypeErrorResponse | InternalServerErrorResponse | TooManyRequestsResponse;

  @route("/login")
  @post op login(
    @body loginRequest: LoginRequest
  ): SuccessResponse | ValidationErrorResponse | AuthUnauthorizedResponse | HttpNotFoundResponse | PayloadTooLargeErrorResponse | UnsupportedMediaTypeErrorResponse | InternalServerErrorResponse | TooManyRequestsResponse;

  @route("/refresh")
  @post op refresh(): SuccessResponse | ValidationErrorResponse | AuthUnauthorizedResponse | PayloadTooLargeErrorResponse | UnsupportedMediaTypeErrorResponse | InternalServerErrorResponse | TooManyRequestsResponse;

  @route("/logout")
  @post op logout(): SuccessResponse | ValidationErrorResponse | AuthUnauthorizedResponse | PayloadTooLargeErrorResponse | UnsupportedMediaTypeErrorResponse | InternalServerErrorResponse | TooManyRequestsResponse;

  @route("/me")
  @get op me(): UserInfo | ValidationErrorResponse | AuthUnauthorizedResponse | InternalServerErrorResponse | TooManyRequestsResponse;
}
