import "@typespec/http";

using Http;
@service(#{ title: "Expense service" })
@server("https://example.com", "Single server endpoint")
namespace ExpenseService;

model User {
  @minValue(1)
  id: integer;
}

model Category {
  @minValue(1)
  id: integer;

  @minValue(1)
  userId: integer;

  @minLength(1)
  name: string;

  subcategory: Subcategory;
}

model Subcategory {
  @minValue(1)
  id: integer;

  @minLength(1)
  name: string;
}

model CategoryListResponse {
  ...OkResponse;
  ...Body<Category[]>;
}

model CategoryResponse {
  ...OkResponse;
  ...Body<Category>;
}

model CategoryCreatedResponse {
  ...CreatedResponse;
  ...Body<Category>;
}

model CategoryErrorResponse {
  ...BadRequestResponse;
  ...Body<ValidationError>;
}

model CategoryNotFoundResponse {
  ...NotFoundResponse;
  ...Body<NotFoundError>;
}

model CategorySuccessResponse {
  ...OkResponse;
  ...Body<string>;
}

model CategoryNoContentResponse {
  ...NoContentResponse;
}

model CategoryCreate {
  @minLength(1)
  name: string;

  subcategory: Subcategory;
}

@route("/categories")
@tag("Categories")
interface Categories {
  @get list(): CategoryListResponse | CategoryNotFoundResponse;

  @get get(
    @path CategoryId: integer,
  ): CategoryResponse | CategoryNotFoundResponse | InternalServerErrorResponse;

  @post create(
    @body category: CategoryCreate,
  ): CategoryCreatedResponse | CategoryErrorResponse | InternalServerErrorResponse;

  @delete delete(@path categoryId: integer): {
    @statusCode statusCode: 204;
  } | InternalServerErrorResponse;
}

model Expense {
  @minValue(1)
  id: integer;

  @minValue(1)
  userId: integer;

  @minValue(0.01)
  amount: float64;

  @minValue(1)
  categoryId: integer;

  description: string;
  date: utcDateTime;
}

model ExpenseListResponse {
  ...OkResponse;
  ...Body<Expense[]>;
}

model ExpenseResponse {
  ...OkResponse;
  ...Body<Expense>;
}

model ExpenseCreatedResponse {
  ...CreatedResponse;
  ...Body<Expense>;
}

model ExpenseErrorResponse {
  ...BadRequestResponse;
  ...Body<ValidationError>;
}

model ExpenseNotFoundResponse {
  ...NotFoundResponse;
  ...Body<NotFoundError>;
}

model ExpenseNoContentResponse {
  ...NoContentResponse;
}

model ExpenseCreate {
  @minValue(0.01)
  amount: float64;

  @minValue(1)
  categoryId: integer;

  description: string;
  date: utcDateTime;
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

@error
model NotFoundError {
  code: "NOT_FOUND";
  message: string;
}

@error
model ValidationError {
  code: "VALIDATION_ERROR";
  message: string;
  details: string[];
}

@error
model InternalServerError {
  code: "INTERNAL_SERVER_ERROR";
  message: string;
}

model InternalServerErrorResponse {
  @statusCode statusCode: 500;
  @body error: InternalServerError;
}

// model CategoryWithRelations{
//   ...Category,
//   posts?: PostPublic[]
// }
//
// enum PostVariant{
//   SIMPLE,
//   REPLY,
//   TRAVEL
// }
//
// model Post{
//   id: integer,
//   url: string,
//   title: string,
//   content: string,
//   categoryId: Category.id,
//   variant: PostVariant,
//   replyId: Post.id | null,
//   lat: numeric | null,
//   lng: numeric | null,
//   status: "draft" | "moderating" | "published" | "rejected"
// }
//
// model PostPublic{
//   ...OmitProperties<Post, "status">
// }
//
// model PostPublicWithRelations{
//   ...PostPublic,
//   category?: Category
// }
//
// model PostSimpleBody{}
// model PostReplyBody{ replyId: Post.id }
// model PostTravelBody{ lat: numeric, lng: numeric }
//
// @discriminated
// union PostBodyVariant{
//   SIMPLE: PostSimpleBody,
//   REPLY: PostReplyBody,
//   TRAVEL: PostTravelBody
// }
//
// model PostBody{
//   @minLength(5) @maxLength(16) @pattern("^[a-zA-Z0-9-]*$") url: string,
//   @minLength(5) @maxLength(32) title: string,
//   @minLength(10) @maxLength(8192) content: string,
//   categoryId: Category.id,
//   variant: PostBodyVariant
// }
//
// model PostBodyUpd{
//   ...OptionalProperties<PostBody>
// }
//
//
//
// @route("/posts")
// @tag("Posts")
// interface Posts{
//   @get index(): PostPublic[];
//   @get item(@path id: Post.id): PostPublic
// }
//
// @route("/office/posts")
// @tag("Posts Resource")
// interface PostsResource{
//   @get index(): Post[];
//   @get item(@path id: Post.id): Post;
//   @post store(@body body: PostBody): Post;
//   @patch(#{implicitOptionality: false}) update(@path id: Post.id, @body body: PostBodyUpd): Post;
//   @delete remove(@path id: Post.id): true;
// }
