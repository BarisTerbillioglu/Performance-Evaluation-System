using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PerformanceEvaluation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class YourMigrationName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EvaluatorAssignments_Users_UserID",
                table: "EvaluatorAssignments");

            migrationBuilder.DropIndex(
                name: "IX_EvaluatorAssignments_UserID",
                table: "EvaluatorAssignments");

            migrationBuilder.DropColumn(
                name: "UserID",
                table: "EvaluatorAssignments");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Team",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "EmployeeID",
                table: "EvaluatorAssignments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "ID",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$RG4s4bsGIi5uI1V6W5EDUuDkKKAbB/71u5MwEWh85L7tBFKfi3qZ6");

            migrationBuilder.CreateIndex(
                name: "IX_Team_Description",
                table: "Team",
                column: "Description",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EvaluatorAssignments_EmployeeID",
                table: "EvaluatorAssignments",
                column: "EmployeeID");

            migrationBuilder.AddForeignKey(
                name: "FK_EvaluatorAssignments_Users_EmployeeID",
                table: "EvaluatorAssignments",
                column: "EmployeeID",
                principalTable: "Users",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EvaluatorAssignments_Users_EmployeeID",
                table: "EvaluatorAssignments");

            migrationBuilder.DropIndex(
                name: "IX_Team_Description",
                table: "Team");

            migrationBuilder.DropIndex(
                name: "IX_EvaluatorAssignments_EmployeeID",
                table: "EvaluatorAssignments");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Team");

            migrationBuilder.DropColumn(
                name: "EmployeeID",
                table: "EvaluatorAssignments");

            migrationBuilder.AddColumn<int>(
                name: "UserID",
                table: "EvaluatorAssignments",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "ID",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$U3O2KBocQu5/eNWyq6HareEy7Z1QLjrgV783cpVlZxDEsAQodJe3K");

            migrationBuilder.CreateIndex(
                name: "IX_EvaluatorAssignments_UserID",
                table: "EvaluatorAssignments",
                column: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_EvaluatorAssignments_Users_UserID",
                table: "EvaluatorAssignments",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "ID");
        }
    }
}
