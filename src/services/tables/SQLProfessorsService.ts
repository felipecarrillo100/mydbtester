import {SQLiteService} from "./SQLiteService";

export interface Professor {
    id?: number;
    name: string;
    lastname: string;
    phone: string;
}

class SQLProfessorsService extends SQLiteService<Professor> {
    protected getTableName(): string {
        return "Professors";
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
    SQLProfessorsService
}