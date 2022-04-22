import {SQLiteService} from "./SQLiteService";

export interface Student {
    id?: number;
    name: string;
    lastname: string;
    phone: string;
}

class SQLStudentService extends SQLiteService<Student> {
    protected getTableName(): string {
        return "Students";
    };
    protected getColumns()  { return ["name", "lastname", "phone"]};

    protected getTableDefinition(): string {
        const TableDefinition = "CREATE TABLE IF NOT EXISTS " + this.getTableName() + "(\n" +
            "   "+this.getId() + " INTEGER PRIMARY KEY AUTOINCREMENT,\n" +
            "   name char[128] NOT NULL,\n" +
            "   lastname char[128] NOT NULL,\n" +
            "   phone char[128] NOT NULL\n" +
            ");";
        return TableDefinition;
    }

}

export {
    SQLStudentService
}