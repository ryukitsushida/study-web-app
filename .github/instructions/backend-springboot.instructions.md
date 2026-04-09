---
applyTo: "backend/springboot/**"
---

# Backend (Spring Boot) 指示

## ① 技術スタック

| カテゴリ           | 技術                      | バージョン |
| ------------------ | ------------------------- | ---------- |
| 言語               | Java                      | 17         |
| フレームワーク     | Spring Boot               | 3.4.x      |
| ビルドツール       | Gradle (Groovy DSL)       | 8.12       |
| ORM                | Spring Data JPA (Hibernate)| -         |
| DB ドライバ        | PostgreSQL JDBC            | -         |
| バリデーション     | Jakarta Bean Validation    | -         |
| テスト             | JUnit 5 + Mockito + Testcontainers | - |

## ② ディレクトリ構成

```
backend/springboot/
├── build.gradle
├── settings.gradle
├── Dockerfile
├── .env.example
├── src/
│   ├── main/
│   │   ├── java/com/example/todoapi/
│   │   │   ├── TodoApiApplication.java         # メインクラス
│   │   │   ├── config/
│   │   │   │   └── CorsConfig.java             # CORS 設定
│   │   │   ├── controller/
│   │   │   │   ├── TodoController.java         # REST エンドポイント
│   │   │   │   └── HealthController.java       # ヘルスチェック
│   │   │   ├── dto/
│   │   │   │   ├── request/
│   │   │   │   │   ├── CreateTodoRequest.java
│   │   │   │   │   └── UpdateTodoRequest.java
│   │   │   │   └── response/
│   │   │   │       ├── TodoResponse.java
│   │   │   │       └── ErrorResponse.java
│   │   │   ├── entity/
│   │   │   │   └── Todo.java                   # JPA エンティティ
│   │   │   ├── exception/
│   │   │   │   ├── AppException.java           # 基底例外
│   │   │   │   ├── TodoNotFoundException.java  # 404
│   │   │   │   └── GlobalExceptionHandler.java # @RestControllerAdvice
│   │   │   ├── repository/
│   │   │   │   └── TodoRepository.java         # Spring Data JPA
│   │   │   └── service/
│   │   │       └── TodoService.java            # ビジネスロジック
│   │   └── resources/
│   │       └── application.yml
│   └── test/
│       └── java/com/example/todoapi/
│           ├── controller/
│           │   └── TodoControllerTest.java     # 統合テスト (Testcontainers)
│           └── service/
│               └── TodoServiceTest.java        # 単体テスト (Mockito)
```

- ファイル名: PascalCase（Java クラス標準）
- パッケージ名: すべて小文字 (`com.example.todoapi`)
- テストクラス名: `<対象クラス名>Test`

## ③ アーキテクチャ・設計指針

- **レイヤードアーキテクチャ**: Controller → Service → Repository の 3 層構造を遵守する
  - **Controller 層**: リクエスト受付・レスポンス返却のみ。`@RestController` + `@RequestMapping`
  - **Service 層**: ビジネスロジックを集約。`@Service` + `@Transactional`
  - **Repository 層**: Spring Data JPA でデータベース操作。`JpaRepository` を継承する
- **依存性注入**: コンストラクタインジェクションを使用する（`@Autowired` アノテーションは省略可）
- **DTO 設計**: `dto/request/` にリクエスト DTO、`dto/response/` にレスポンス DTO を配置する。Entity を直接公開しない
- **JPA エンティティ**: `@Entity` + `@Table(name = "todos")` で既存テーブルにマッピング。`@PrePersist` / `@PreUpdate` で日時自動設定
- **PATCH 対応**: `UpdateTodoRequest` でセッターを通じて `presentFields` を追跡し、送信されたフィールドのみ更新する
- **例外処理**: `AppException` 基底クラス + `@RestControllerAdvice` の `GlobalExceptionHandler` でエラーレスポンスに変換
- **設定管理**: `application.yml` で環境変数をバインド。`${DATABASE_URL:default}` 形式でデフォルト値を設定
- **JSON シリアライズ**: Jackson の `SNAKE_CASE` 戦略で自動的にスネークケース変換（`createdAt` → `created_at`）

### DB マイグレーション

- **Alembic（FastAPI 側）がスキーマ管理の単一ソース**
- Spring Boot 側は `spring.jpa.hibernate.ddl-auto=none` でスキーマ変更を行わない
- テーブル追加時のフロー: Alembic でマイグレーション → Spring Boot の Entity を更新

## ④ テスト方針

- **テストフレームワーク**: JUnit 5 + Spring Boot Test + Testcontainers PostgreSQL
- **統合テスト**: `@SpringBootTest` + `@AutoConfigureMockMvc` + `@Testcontainers` で実 DB と接続してエンドポイントをテスト
- **単体テスト**: `@ExtendWith(MockitoExtension.class)` で Repository をモックし、Service のビジネスロジックを検証
- **テスト用 DB**: Testcontainers で PostgreSQL コンテナを起動。`@DynamicPropertySource` で接続情報を注入
- **テストファイル配置**: `src/test/java/` に本番コードと同じパッケージ構造で配置
- **カバレッジ目標**: Service 層 80% 以上、Controller 層は主要パス (正常系 + 主要エラー系) をカバー
- **テスト実行**: `cd backend/springboot && ./gradlew test`
