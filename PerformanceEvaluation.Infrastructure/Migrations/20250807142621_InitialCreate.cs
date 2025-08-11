using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PerformanceEvaluation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CriteriaCategories",
                columns: table => new
                {
                    CategoryID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CategoryName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Weight = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CriteriaCategories", x => x.CategoryID);
                });

            migrationBuilder.CreateTable(
                name: "Departments",
                columns: table => new
                {
                    DepartmentID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DepartmentName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Departments", x => x.DepartmentID);
                });

            migrationBuilder.CreateTable(
                name: "JobRoles",
                columns: table => new
                {
                    RoleID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobRoles", x => x.RoleID);
                });

            migrationBuilder.CreateTable(
                name: "Criteria",
                columns: table => new
                {
                    CriteriaID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CriteriaName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    BaseDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CategoryID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Criteria", x => x.CriteriaID);
                    table.ForeignKey(
                        name: "FK_Criteria_CriteriaCategories_CategoryID",
                        column: x => x.CategoryID,
                        principalTable: "CriteriaCategories",
                        principalColumn: "CategoryID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FirstName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DepartmentID = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserID);
                    table.ForeignKey(
                        name: "FK_Users_Departments_DepartmentID",
                        column: x => x.DepartmentID,
                        principalTable: "Departments",
                        principalColumn: "DepartmentID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RoleCriteriaDescriptions",
                columns: table => new
                {
                    DescriptionID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Example = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CriteriaID = table.Column<int>(type: "int", nullable: false),
                    RoleID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoleCriteriaDescriptions", x => x.DescriptionID);
                    table.ForeignKey(
                        name: "FK_RoleCriteriaDescriptions_Criteria_CriteriaID",
                        column: x => x.CriteriaID,
                        principalTable: "Criteria",
                        principalColumn: "CriteriaID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RoleCriteriaDescriptions_JobRoles_RoleID",
                        column: x => x.RoleID,
                        principalTable: "JobRoles",
                        principalColumn: "RoleID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EvaluationAssignments",
                columns: table => new
                {
                    AssignmentID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AssignedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    EvaluatorID = table.Column<int>(type: "int", nullable: false),
                    EmployeeID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EvaluationAssignments", x => x.AssignmentID);
                    table.ForeignKey(
                        name: "FK_EvaluationAssignments_Users_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EvaluationAssignments_Users_EvaluatorID",
                        column: x => x.EvaluatorID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Evaluations",
                columns: table => new
                {
                    EvaluationID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EvaluatorID = table.Column<int>(type: "int", nullable: false),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    EvaluationPeriod = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TotalScore = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    GeneralComments = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Evaluations", x => x.EvaluationID);
                    table.ForeignKey(
                        name: "FK_Evaluations_Users_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Evaluations_Users_EvaluatorID",
                        column: x => x.EvaluatorID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserRoles",
                columns: table => new
                {
                    UserRoleID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserID = table.Column<int>(type: "int", nullable: false),
                    RoleID = table.Column<int>(type: "int", nullable: false),
                    AssignedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRoles", x => x.UserRoleID);
                    table.ForeignKey(
                        name: "FK_UserRoles_JobRoles_RoleID",
                        column: x => x.RoleID,
                        principalTable: "JobRoles",
                        principalColumn: "RoleID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserRoles_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EvaluationScores",
                columns: table => new
                {
                    ScoreID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Score = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EvaluationID = table.Column<int>(type: "int", nullable: false),
                    CriteriaID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EvaluationScores", x => x.ScoreID);
                    table.ForeignKey(
                        name: "FK_EvaluationScores_Criteria_CriteriaID",
                        column: x => x.CriteriaID,
                        principalTable: "Criteria",
                        principalColumn: "CriteriaID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EvaluationScores_Evaluations_EvaluationID",
                        column: x => x.EvaluationID,
                        principalTable: "Evaluations",
                        principalColumn: "EvaluationID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Comments",
                columns: table => new
                {
                    CommentID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ScoreID = table.Column<int>(type: "int", nullable: false),
                    CommentDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comments", x => x.CommentID);
                    table.ForeignKey(
                        name: "FK_Comments_EvaluationScores_ScoreID",
                        column: x => x.ScoreID,
                        principalTable: "EvaluationScores",
                        principalColumn: "ScoreID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Departments",
                columns: new[] { "DepartmentID", "CreatedDate", "DepartmentName", "Description", "IsActive" },
                values: new object[] { 1, new DateTime(2025, 7, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Money Transfer Department", null, true });

            migrationBuilder.InsertData(
                table: "JobRoles",
                columns: new[] { "RoleID", "Description", "IsActive", "RoleName" },
                values: new object[,]
                {
                    { 1, "System Administrator", true, "Admin" },
                    { 2, "Can evaluate employees", true, "Evaluator" },
                    { 3, "Regular employee", true, "Employee" },
                    { 4, "Business Analyst", true, "Business Analyst" },
                    { 5, "Software Developer", true, "Developer" },
                    { 6, "Quality Assurance Specialist", true, "QA Specialist" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "UserID", "CreatedDate", "DepartmentID", "Email", "FirstName", "IsActive", "LastName", "PasswordHash", "UpdatedDate" },
                values: new object[] { 1, new DateTime(2025, 7, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "admin@vakifbank.com", "System", true, "Admin", "$2a$11$k8NqsIWNZNc04q3hz4K22.2AIxMe731uW7rDdTbvf8.HnWPlLfFAC", null });

            migrationBuilder.InsertData(
                table: "UserRoles",
                columns: new[] { "UserRoleID", "AssignedDate", "RoleID", "UserID" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 7, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, 1 },
                    { 2, new DateTime(2025, 7, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, 1 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Comments_CommentDescription",
                table: "Comments",
                column: "CommentDescription",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Comments_ScoreID",
                table: "Comments",
                column: "ScoreID");

            migrationBuilder.CreateIndex(
                name: "IX_Criteria_CategoryID",
                table: "Criteria",
                column: "CategoryID");

            migrationBuilder.CreateIndex(
                name: "IX_CriteriaCategories_CategoryName",
                table: "CriteriaCategories",
                column: "CategoryName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Departments_DepartmentName",
                table: "Departments",
                column: "DepartmentName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EvaluationAssignments_EmployeeID_EvaluatorID",
                table: "EvaluationAssignments",
                columns: new[] { "EmployeeID", "EvaluatorID" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EvaluationAssignments_EvaluatorID",
                table: "EvaluationAssignments",
                column: "EvaluatorID");

            migrationBuilder.CreateIndex(
                name: "IX_Evaluations_EmployeeID",
                table: "Evaluations",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_Evaluations_EvaluatorID",
                table: "Evaluations",
                column: "EvaluatorID");

            migrationBuilder.CreateIndex(
                name: "IX_EvaluationScores_CriteriaID_EvaluationID",
                table: "EvaluationScores",
                columns: new[] { "CriteriaID", "EvaluationID" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EvaluationScores_EvaluationID",
                table: "EvaluationScores",
                column: "EvaluationID");

            migrationBuilder.CreateIndex(
                name: "IX_JobRoles_RoleName",
                table: "JobRoles",
                column: "RoleName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RoleCriteriaDescriptions_CriteriaID_RoleID",
                table: "RoleCriteriaDescriptions",
                columns: new[] { "CriteriaID", "RoleID" });

            migrationBuilder.CreateIndex(
                name: "IX_RoleCriteriaDescriptions_RoleID",
                table: "RoleCriteriaDescriptions",
                column: "RoleID");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_RoleID",
                table: "UserRoles",
                column: "RoleID");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_UserID_RoleID",
                table: "UserRoles",
                columns: new[] { "UserID", "RoleID" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_DepartmentID",
                table: "Users",
                column: "DepartmentID");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Comments");

            migrationBuilder.DropTable(
                name: "EvaluationAssignments");

            migrationBuilder.DropTable(
                name: "RoleCriteriaDescriptions");

            migrationBuilder.DropTable(
                name: "UserRoles");

            migrationBuilder.DropTable(
                name: "EvaluationScores");

            migrationBuilder.DropTable(
                name: "JobRoles");

            migrationBuilder.DropTable(
                name: "Criteria");

            migrationBuilder.DropTable(
                name: "Evaluations");

            migrationBuilder.DropTable(
                name: "CriteriaCategories");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Departments");
        }
    }
}
